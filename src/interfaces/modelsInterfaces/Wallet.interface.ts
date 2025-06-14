import { Document, Types } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
}