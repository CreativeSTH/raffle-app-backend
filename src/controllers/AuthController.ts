import { Request, Response } from 'express';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Pocket from '../models/Pocket';
import VerificationToken from '../models/VerificationToken';
import Referral from '../models/Referral';
import { sendEmail } from '../services/emailSender';
import {getVerificationEmailHTML, getConfirmationRegisterEmailHTML} from '../utils/emailTemplates'
import { generateReferralCode, generateToken, hashPassword, generateJWToken, comparePassword } from '../utils/helpers';


// Registrar Usuario
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, referredBy } = req.body;

    // 1. Validación de campos obligatorios
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // 2. Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
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
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

//Verificar Correo
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (typeof token !== 'string') {
      return res.status(400).json({ message: 'Token inválido' });
    }

    // 1. Buscar el token
    const record = await VerificationToken.findOne({ token });
    if (!record) {
      return res.status(404).json({ message: 'Token no encontrado o ya expirado' });
    }

    // 2. Verificar expiración
    if (record.expiresAt < new Date()) {
      await VerificationToken.deleteOne({ _id: record._id });
      return res.status(410).json({ message: 'Token expirado, solicita uno nuevo' });
    }

    // 3. Marcar el usuario como verificado
    await User.updateOne({ _id: record.userId }, { isEmailVerified: true });

    // 4. Obtener el email del usuario
    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(500).json({ message: 'Usuario no encontrado tras verificación' });
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
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Iniciar Sesion
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validar campos
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    // 2. Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Verificar que haya confirmado su email
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Debes verificar tu correo antes de iniciar sesión' });
    }

    // 4. Comparar contraseña
    const passwordMatch = comparePassword(password, user.password)
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
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
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
