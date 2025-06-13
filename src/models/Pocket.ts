import { Schema, model } from 'mongoose';
import { IPocket } from '../interfaces/Pocket.interface';

const pocketSchema = new Schema<IPocket>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
}, { timestamps: true });

export default model<IPocket>('Pocket', pocketSchema);