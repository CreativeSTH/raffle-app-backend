// src/models/auditLog.model.ts
import { Schema, model, Document } from 'mongoose';
import { IAuditLog } from '../interfaces/modelsInterfaces/IAuditLog';

interface IAuditLogDocument extends IAuditLog, Document {}

const auditLogSchema = new Schema<IAuditLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  description: { type: String },
  ip:{ type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const AuditLog = model<IAuditLogDocument>('AuditLog', auditLogSchema);
