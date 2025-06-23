import { Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string;
  details: string;
  description?: string;
  userAgent?: string;
  createdAt: Date;
}
