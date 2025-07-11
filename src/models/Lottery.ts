import { Schema, model } from 'mongoose';
import { ILottery } from '../interfaces/modelsInterfaces/Lottery.interface';
import { LOTTERY_GAME_DAYS } from '../constants/lotteryGameDays';

const LotterySchema = new Schema<ILottery>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    gameDays: {
      type: [String],
      enum: LOTTERY_GAME_DAYS,
      required: true,
    },
    gameTime: {
      type: String,
      required: true,
      match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // Validación básica HH:mm 24h
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lottery = model<ILottery>('Lottery', LotterySchema);