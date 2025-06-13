import { Schema, model } from 'mongoose';
import { IAuditLog } from '../interfaces/Audit-log.interface';

const auditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  details: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default model<IAuditLog>('AuditLog', auditLogSchema);