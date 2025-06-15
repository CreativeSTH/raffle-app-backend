// src/interfaces/modelsInterfaces/Otp.Interface.ts

import { Types } from 'mongoose';

export interface IOtp {
  userId: Types.ObjectId;
  code: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
