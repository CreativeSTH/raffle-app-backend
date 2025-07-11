import User from '../models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { UserRole } from '../constants/userRoles';


// Genera un código de referido único
export const generateReferralCode = async (): Promise<string> => {
  let code;
  let exists = true;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await User.findOne({ referralCode: code });
    if (!existing) exists = false;
  } while (exists);
  return code;
};

// Genera un código Token
export const generateToken = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Hashear contraseña
export const hashPassword = async (password: string, saltRounds = 10): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

export const generateJWToken = (id: string, email: string, role: UserRole): string => {
  const secret: Secret = process.env.JWT_SECRET as Secret;

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en el archivo .env');
  }

  return jwt.sign(
    { id, email, role },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};

export const comparePassword = async (password:string, userPassword:string) => {
  return await bcrypt.compare(password, userPassword!);
};

