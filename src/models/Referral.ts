import { Schema, model } from 'mongoose';
import { IReferral } from '../interfaces/Referral.interface';

const referralSchema = new Schema<IReferral>({
  referredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referredUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referredAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default model<IReferral>('Referral', referralSchema);