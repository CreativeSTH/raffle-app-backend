import { Document, Types } from 'mongoose';

export interface IVerificationToken extends Document {
  userId: Types.ObjectId;
  token: string;
  type: 'email' | 'otp';
  expiresAt: Date;
}