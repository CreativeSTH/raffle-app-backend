import axios from 'axios';

interface RecaptchaResult {
  isHuman: boolean;
  score: number;
  action: string;
  message?: string;
}

export const validateRecaptcha = async (
  token: string,
  expectedAction: string
): Promise<RecaptchaResult> => {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      throw new Error('La clave secreta de reCAPTCHA no está configurada en las variables de entorno');
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const { data } = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params
    );

    const { success, score, action } = data;

    const isHuman = success && action === expectedAction && score >= 0.5;

    return {
      isHuman,
      score,
      action,
      message: isHuman
        ? 'Verificación reCAPTCHA pasada exitosamente'
        : 'Verificación reCAPTCHA fallida'
    };
  } catch (error) {
    console.error('Error al verificar reCAPTCHA:', error);
    return {
      isHuman: false,
      score: 0,
      action: '',
      message: 'Error interno al validar reCAPTCHA'
    };
  }
};
