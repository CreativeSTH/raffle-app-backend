import { Document, Types } from 'mongoose';

export interface IDraw extends Document {
  lotteryId: Types.ObjectId;
  drawNumber:number;
  winningNumber: number;
  date: Date;
}