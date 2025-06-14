import { Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  userId: Types.ObjectId;
  details: string;
  createdAt: Date;
}
