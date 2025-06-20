import { z } from 'zod';

export const updateOtpPreferenceSchema = z.object({
  isOTPEnabled: z.boolean({
    required_error: 'El campo isOTPEnabled es obligatorio',
    invalid_type_error: 'El campo isOTPEnabled debe ser true o false',
  }),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
      message: 'La nueva contraseña debe contener al menos una letra y un número',
    }),
});