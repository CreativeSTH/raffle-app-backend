import { Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: string;
  message: string;
  sentAt: Date;
}
