import { Document, Types } from 'mongoose';

export interface ITicket extends Document {
  raffleId: Types.ObjectId;
  userId: Types.ObjectId;
  number: number;
  status: 'reserved' | 'paid';
  reservedAt: Date;
  expiresAt?: Date;
}