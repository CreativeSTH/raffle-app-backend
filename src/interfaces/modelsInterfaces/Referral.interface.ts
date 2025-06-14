import { Document, Types } from 'mongoose';

export interface IReferral extends Document {
  referredBy: Types.ObjectId;
  referredUser: Types.ObjectId;
  referredAt: Date;
}