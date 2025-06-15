import { z } from 'zod';

export const updateOtpPreferenceSchema = z.object({
  isOTPEnabled: z.boolean({
    required_error: 'El campo isOTPEnabled es obligatorio',
    invalid_type_error: 'El campo isOTPEnabled debe ser true o false',
  }),
});
