import { Document, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  method: 'Wompi' | 'ePayco' | 'Crypto';
  amount: number;
}