import { Schema, model } from 'mongoose';
import { IVerificationToken } from '../interfaces/Verification-token.interface';

const verificationTokenSchema = new Schema<IVerificationToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  type: { type: String, enum: ['email', 'otp'], required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default model<IVerificationToken>('VerificationToken', verificationTokenSchema);