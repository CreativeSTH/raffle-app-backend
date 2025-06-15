// Enviar correo de verificacion de cuenta
export const getVerificationEmailHTML = (token: string): string => {
  const verificationLink = `http://localhost:4000/api/auth/verify-email?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">¡Bienvenido a RIFIFY!</h2>
        <p>Gracias por registrarte. Por favor haz clic en el botón de abajo para verificar tu correo electrónico:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; margin-top: 20px; text-decoration: none; border-radius: 4px;">
          Verificar mi cuenta
        </a>
        <p style="margin-top: 20px;">O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all;">${verificationLink}</p>
        <hr />
        <p style="font-size: 12px; color: #777;">Si no solicitaste este correo, simplemente ignóralo.</p>
    </div>
  `;
};

export const getConfirmationRegisterEmailHTML = () =>{
    const loginLink = `http://localhost:4000/auth/login`;
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">¡Tu cuenta de RIFIFY ha sido Activada!</h2>
        <p>Gracias por confirmar tu correo. Por favor haz clic en el botón de abajo para iniciar session:</p>
        <a href="${loginLink}" 
           style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; margin-top: 20px; text-decoration: none; border-radius: 4px;">
          Iniciar Session
        </a>
        <p style="margin-top: 20px;">O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all;">${loginLink}</p>
        <hr />
        <p style="font-size: 12px; color: #777;">Si no solicitaste este correo, simplemente ignóralo.</p>
    </div>
  `;
};

export const otpCodeEmailHTML = (otp:string): string =>{
    const loginLink = `http://localhost:4000/auth/login`;
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">¡Código único de inicio de sesión!</h2>
        <p>Has Recibido un código único de inicio de sesión:</p>
        <div 
           style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; margin-top: 20px; text-decoration: none; border-radius: 4px;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">Si no haz solicitado este código alguien esta intentando ingresar a tu cuenta, puedes por seguridad desactivar esta forma de inicio de sessón</p>
        <p style="word-break: break-all;">${loginLink}</p>
        <hr />
        <p style="font-size: 12px; color: #777;">Si no solicitaste este correo, simplemente ignóralo.</p>
    </div>
  `;
};