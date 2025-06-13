import { Schema, model } from 'mongoose';
import { IDraw } from '../interfaces/Draw.interface';

const drawSchema = new Schema<IDraw>({
  lotteryId: { type: Schema.Types.ObjectId, ref: 'Lottery', required: true },
  drawNumber: { type: Number, required: true },
  winningNumber: { type: Number, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

export default model<IDraw>('Draw', drawSchema);