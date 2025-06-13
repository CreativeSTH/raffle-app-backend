import { Schema, model } from 'mongoose';
import { ILottery } from '../interfaces/Lottery.interface';

const lotterySchema = new Schema<ILottery>({
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

export default model<ILottery>('Lottery', lotterySchema);