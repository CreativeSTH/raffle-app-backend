import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/modelsInterfaces/User.Interface';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    referralCode: { type: String, unique: true },
    referredBy: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isOTPEnabled: { type: Boolean, default: false },
    isAuthenticatorEnabled: { type: Boolean, default: false },
    authenticatorSecret: { type: String, default: null },
    failed2FAAttempts: {type: Number,default: 0,},
    lockedUntil2FA: {type: Date, default: null,},
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);