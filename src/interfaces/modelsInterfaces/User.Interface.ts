import { Types } from 'mongoose';
import { UserRole } from '../../constants/userRoles';

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  isEmailVerified: boolean;
  isOTPEnabled: boolean;
  isAuthenticatorEnabled?: boolean;
  authenticatorSecret?: string | null;
  failed2FAAttempts: number;
  lockedUntil2FA?: Date | null;
  companyId?: Types.ObjectId;
  recoveryCode?: string;
  recoveryCodeExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
