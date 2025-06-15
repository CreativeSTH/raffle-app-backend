import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Pocket from '../models/Pocket';
import VerificationToken from '../models/VerificationToken';
import Referral from '../models/Referral';
import OtpModel from '../models/Otp';
import { sendEmail } from '../services/emailSender';
import {getVerificationEmailHTML, getConfirmationRegisterEmailHTML, otpCodeEmailHTML} from '../utils/emailTemplates'
import { generateReferralCode, generateToken, hashPassword, generateJWToken, comparePassword } from '../utils/helpers';
import { generateOtp } from '../utils/generateOTP'
import { AppError } from '../utils/AppError'
import { validateRecaptcha } from '../utils/validateRecaptcha';


// Registrar Usuario
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, referredBy } = req.body;

    // Validar reCAPTCHA
    // if (!recaptchaToken) throw new AppError('Token de reCAPTCHA no proporcionado', 400);
    // const recaptcha = await validateRecaptcha(recaptchaToken, 'register');
    // if (!recaptcha.isHuman) throw new AppError('Falló la validación reCAPTCHA: ' + recaptcha.message, 403);


    // 1. Validación de campos obligatorios
    if (!name || !email || !password) {
      throw new AppError('Todos los campos son obligatorios', 400);
    }

    // 2. Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('El correo ya está registrado', 409);
    }

    // 3. Hashear contraseña
    const hashedPassword = await hashPassword(password);


    // 4. Generar código de referido único
    const referralCode = await generateReferralCode();

    // 5. Crear nuevo usuario
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      referralCode,
      isEmailVerified: false,
      referredBy,
      role: 'user'
    });

    // 6. Crear Wallet y Bolsillo (points separados)
    await Wallet.create({ userId: newUser._id, balance: 0 });
    await Pocket.create({ userId: newUser._id, points: 0 });

    // 7. Si fue referido, guardar en tabla de referidos
    if (referredBy) {
      const referrerUser = await User.findOne({ referralCode: referredBy });
      if (referrerUser) {
        await Referral.create({
          referredBy: referrerUser._id,
          referredUser: newUser._id,
          referredAt: new Date()
        });
      }
    }

    // 8. Generar token de verificación
    const token = generateToken();
    await VerificationToken.create({
      userId: newUser._id,
      token,
      type: 'email',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
    });

    // 9. Enviar email de verificación
    const subject = "Verifica tu cuenta en RIFIFY 🎯";
    const html = getVerificationEmailHTML(token);
    await sendEmail({ to: email, subject, html });

    // 10. Responder al frontend
    res.status(201).json({ message: 'Usuario registrado. Verifica tu correo electrónico.' });
  } catch (error) {
    console.error('Error en register:', error);
    throw new AppError('Error interno del servidor', 500);
  }
};

//Verificar Correo
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (typeof token !== 'string') {
      throw new AppError('Token inválido', 400);
    }

    // 1. Buscar el token
    const record = await VerificationToken.findOne({ token });
    if (!record) {
      throw new AppError('Token no encontrado o ya expirado', 404);
    }

    // 2. Verificar expiración
    if (record.expiresAt < new Date()) {
      await VerificationToken.deleteOne({ _id: record._id });
      throw new AppError('Token expirado, solicita uno nuevo', 410);
    }

    // 3. Marcar el usuario como verificado
    await User.updateOne({ _id: record.userId }, { isEmailVerified: true });

    // 4. Obtener el email del usuario
    const user = await User.findById(record.userId);
    if (!user) {
      throw new AppError('Usuario no encontrado tras verificación', 500);
    }

    // 5. Enviar correo de confirmación
    const subject = 'Tu cuenta en RIFIFY ha sido activada 🎉';
    const html    = getConfirmationRegisterEmailHTML();
    await sendEmail({
      to: user.email,
      subject,
      html,
    });

    // 6. Eliminar el token
    await VerificationToken.deleteOne({ _id: record._id });

    // 7. Responder éxito
    return res.status(200).json({
      message: '¡Email verificado correctamente y correo de bienvenida enviado!'
    });
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    throw new AppError('Error interno del servidor', 500);
  }
};

// Iniciar Sesion
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
   
    //Validación token reCHAPTCHA
    // if (!recaptchaToken) throw new AppError('Token de reCAPTCHA no proporcionado', 400);
    // const recaptcha = await validateRecaptcha(recaptchaToken, 'login');
    // if (!recaptcha.isHuman) throw new AppError('Falló la validación reCAPTCHA: ' + recaptcha.message, 403);

    // 1. Validar campos
    if (!email || !password) {
      throw new AppError('Email y contraseña son obligatorios', 400);
    }

    // 2. Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // 3. Verificar que haya confirmado su email
    if (!user.isEmailVerified) {
      throw new AppError('Debes verificar tu correo antes de iniciar sesión', 403);
    }

    // 4. Comparar contraseña
    const passwordMatch = await comparePassword(password, user.password)
    
    if (!passwordMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // 5. Generar JWT
    const token = generateJWToken(user._id.toString());

    // 6. Responder con token y datos básicos
    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return next(error);
  }
};

export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    //Validar reCAPTCHA
    // if (!recaptchaToken) throw new AppError('Token de reCAPTCHA no proporcionado', 400);
    // const recaptcha = await validateRecaptcha(recaptchaToken, 'request_otp');
    // if (!recaptcha.isHuman) throw new AppError('Falló la validación reCAPTCHA: ' + recaptcha.message, 403);

    const user = await User.findOne({ email });
    if (!user || !user.isEmailVerified || !user.isOTPEnabled) {
      throw new AppError('Usuario no elegible para login por OTP', 400);
    }

    const otp = generateOtp(); // genera un código de 6 dígitos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await OtpModel.findOneAndUpdate(
      { userId: user._id },
      { code: otp, expiresAt },
      { upsert: true, new: true }
    );

    const subject = "Código único de inicio de sesión 🎯";
    const html = otpCodeEmailHTML(otp);
    await sendEmail({to: user.email, subject, html,}); 
    res.status(200).json({ message: 'OTP enviado al correo' });
  } catch (err) {
    next(err);
  }
};

export const verifyOtpLogin = async (req: Request, res: Response) => {
  const { email, code, recaptchaToken } = req.body;

  //Validar reCAPTCHA
  if (!recaptchaToken) throw new AppError('Token de reCAPTCHA no proporcionado', 400);
  const recaptcha = await validateRecaptcha(recaptchaToken, 'verify_otp');
  if (!recaptcha.isHuman) throw new AppError('Falló la validación reCAPTCHA: ' + recaptcha.message, 403);

  // 1. Buscar el usuario por email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // 2. Verificar si tiene el OTP login habilitado
  if (!user.isOTPEnabled) {
    throw new AppError('El inicio de sesión por OTP no está habilitado para este usuario', 403);
  }

  // 3. Buscar el código OTP correspondiente al usuario
  const otpEntry = await OtpModel.findOne({ userId: user._id });
  if (!otpEntry) {
    throw new AppError('No se encontró un código OTP para este usuario', 404);
  }

  // 4. Verificar si el código es correcto
  if (otpEntry.code !== code) {
    throw new AppError('Código OTP incorrecto', 401);
  }

  // 5. Verificar si ha expirado
  if (otpEntry.expiresAt < new Date()) {
    throw new AppError('El código OTP ha expirado', 410);
  }

  // 6. Generar el token usando tu helper personalizado
  const token = generateJWToken(user._id.toString());

  // 7. Eliminar el OTP ya que fue usado
  await OtpModel.deleteOne({ _id: otpEntry._id });

  // 8. Responder al cliente
  return res.status(200).json({
    message: 'Inicio de sesión por OTP exitoso',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
