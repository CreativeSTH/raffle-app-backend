import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Pocket from '../models/Pocket';
import VerificationToken from '../models/VerificationToken';
import Referral from '../models/Referral';
import OtpModel from '../models/Otp';
import speakeasy from 'speakeasy';
import { sendEmail } from '../services/emailSender';
import {getVerificationEmailHTML, getConfirmationRegisterEmailHTML, otpCodeEmailHTML, resetPasswordEmail} from '../utils/emailTemplates'
import { generateReferralCode, generateToken, hashPassword, generateJWToken, comparePassword} from '../utils/helpers';
import { generateOtp } from '../utils/generateOTP';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/audit.service';
import { AuditAction } from '../constants/auditActions';
import { validateRecaptcha } from '../utils/validateRecaptcha';


// Registrar Usuario
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, referredBy, recaptchaToken } = req.body;

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

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.REGISTER,
      `Nuevo usuario registrado con el correo ${email}`,
      newUser._id.toString()
    );

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

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.EMAIL_VERIFIED,
      `Email verificado con el correo ${user.email}`,
      user._id.toString()
    );

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
    const { email, password, recaptchaToken } = req.body;

    //Validación token reCHAPTCHA
    // if (!recaptchaToken) throw new AppError('Token de reCAPTCHA no proporcionado', 400);
    // const recaptcha = await validateRecaptcha(recaptchaToken, 'login');
    // if (!recaptcha.isHuman) throw new AppError('Falló la validación reCAPTCHA: ' + recaptcha.message, 403);

    // Validación básica
    if (!email || !password) {
      throw new AppError('Email y contraseña son obligatorios', 400);
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar que haya confirmado su email
    if (!user.isEmailVerified) {
      throw new AppError('Debes verificar tu correo antes de iniciar sesión', 403);
    }

    // Comparar contraseña
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Si el usuario tiene habilitado 2FA con Google Authenticator
    if (user.isAuthenticatorEnabled) {
      // Generamos un token temporal con expiración corta (ej. 5 minutos)
      const tempToken = jwt.sign(
        { userId: user._id },process.env.JWT_SECRET!,{ expiresIn: '5m' }
      );

      // Le indicamos que debe completar 2FA
      return res.status(200).json({
        requires2FA: true,
        tempToken,
        message: 'Autenticación en dos pasos requerida'
      });
    }

    // Si no tiene 2FA, login completo normal
    const token = generateJWToken(user._id.toString(), user.email, user.role);

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.LOGIN,
      `Inicio de sesión exitoso para el usuario ${user.email}`,
      user._id.toString()
    );

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
    const { email, recaptchaToken } = req.body;

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

     // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.OTP_LOGIN_REQUEST,
      `Solicitud Login OTP para el usuario ${user.email}`,
      user._id.toString()
    );

    res.status(200).json({ message: 'OTP enviado al correo' });
  } catch (err) {
    next(err);
  }
};

export const verifyOtpLogin = async (req: Request, res: Response) => {
  const { email, code, recaptchaToken } = req.body;

  // //Validar reCAPTCHA
  // if (!recaptchaToken) throw new AppError('Token de reCAPTCHA no proporcionado', 400);
  // const recaptcha = await validateRecaptcha(recaptchaToken, 'verify_otp');
  // if (!recaptcha.isHuman) throw new AppError('Falló la validación reCAPTCHA: ' + recaptcha.message, 403);

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
  const token = generateJWToken(user._id.toString(), user.email, user.role);

  // 7. Eliminar el OTP ya que fue usado
  await OtpModel.deleteOne({ _id: otpEntry._id });

  // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.OTP_LOGIN_VERIFIED,
      `Solicitud OTP Verificada para el usuario ${user.email}`,
      user._id.toString()
    );
  // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.LOGIN,
      `Login exitoso mediante OTP para el usuario ${user.email}`,
      user._id.toString()
    );

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

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('El correo electrónico es requerido', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No existe un usuario con este correo', 404);
    }

    // --- CASO: Tiene 2FA activo ---
    if (user.isAuthenticatorEnabled && user.authenticatorSecret) {
    
      // 👇 Registro de auditoría
      await auditService.logEvent(
        req,
        AuditAction.PASSWORD_RESET_REQUEST,
        `Solicitud de recuperación de contraseña por el usuario ${user.email}`,
        user._id.toString()
      );

      return res.status(200).json({
        message: '2FA habilitado. Verifica con Google Authenticator.',
        method: '2FA',
      });
    }

    // --- CASO: No tiene 2FA, enviar código por correo ---
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    user.recoveryCode = code;
    user.recoveryCodeExpires = expiration;
    await user.save();

    // Enviar correo (implementa esta función según tu sistema)
    await sendEmail({
      to: user.email,
      subject: 'Código de recuperación de contraseña',
      html: resetPasswordEmail(user.name, code),
    });

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.PASSWORD_RESET_REQUEST,
      `Solicitud de recuperación de contraseña por el usuario ${user.email}`,
      user._id.toString()
    );

    return res.status(200).json({
      message: 'Código enviado por correo',
      method: 'EMAIL',
    });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return next(error);
  }
};

// Validate reset password code
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.isAuthenticatorEnabled) {
      // Validación de código del autenticador
      if (!user.authenticatorSecret) {
        throw new AppError('No hay un secreto de autenticación configurado para este usuario', 400);
      }
      const isValid = speakeasy.totp.verify({
        secret: user.authenticatorSecret,
        encoding: 'base32',
        token: code,
        window: 1,
      });

      if (!isValid) {
        throw new AppError('Código 2FA inválido', 400);
      }

    } else {
      // Validación de código enviado por correo
      if (
        !user.recoveryCode ||
        !user.recoveryCodeExpires ||
        user.recoveryCode !== code ||
        user.recoveryCodeExpires < new Date()
      ) {
        throw new AppError('Código de recuperación inválido o expirado', 400);
      }
    }

    // Generar token temporal válido por 10 minutos
    const tempToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '10m' }
    );

    return res.status(200).json({
      message: 'Código verificado correctamente',
      tempToken,
    });

  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Error desconocido verificando código de recuperación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tempToken, newPassword } = req.body;

    // Verificar token temporal
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as { userId: string };

    if (!decoded?.userId) {
      throw new AppError('Token inválido o expirado', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Actualizar la contraseña
    user.password = await hashPassword(newPassword);

    // Limpiar recovery data
    user.recoveryCode = undefined;
    user.recoveryCodeExpires = undefined;

    await user.save();

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.PASSWORD_RESET_SUCCESS,
      `Contraseña recuperada por el usuario ${user.email}`,
      user._id.toString()
    );

    return res.status(200).json({
      message: 'Contraseña actualizada correctamente',
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    return next(error);
  }
};

