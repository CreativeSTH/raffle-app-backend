import { Document, Types } from 'mongoose';

export interface IReward extends Document {
  userId: Types.ObjectId;
  raffleId: Types.ObjectId;
  pointsUsed: number;
  description: string;
}
