import { Schema, model } from 'mongoose';
import { IOtp } from '../interfaces/modelsInterfaces/Otp.interface';

const otpSchema = new Schema<IOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model<IOtp>('Otp', otpSchema);
