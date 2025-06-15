import { Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin';
  referralCode: string;
  referredBy?: string;
  isEmailVerified: boolean;
  isOTPEnabled: boolean;
  companyId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
