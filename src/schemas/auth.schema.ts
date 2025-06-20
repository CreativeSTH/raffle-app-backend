import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
      message: 'La contraseña debe contener letras y números',
    }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .max(50, { message: 'El nombre es muy largo' }),
  
  email: z
    .string()
    .trim()
    .email({ message: 'Correo electrónico inválido' }),

  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
      message: 'La contraseña debe contener al menos una letra y un número',
    }),

  referredBy: z
    .string()
    .trim()
    .length(6, { message: 'El código de referido debe tener 6 caracteres' })
    .regex(/^[A-Z0-9]{6}$/, {
      message: 'El código de referido solo puede contener letras mayúsculas y números',
    })
    .optional(),
});

export const requestOtpSchema = z.object({
  email: z.string().trim().email(),
});

export const verifyOtpLoginSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }),
  code: z.string().trim().length(6, { message: 'El código debe tener 6 dígitos' }),
});

export const requestResetPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const verifyResetPasswordCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(10),
});

export const resetPassSchema = z.object({
  tempToken: z.string().nonempty('El token temporal es requerido'),
  newPassword: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
      message: 'La contraseña debe contener al menos una letra y un número',
    }),
});