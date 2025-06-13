import { Document, Types } from 'mongoose';

export interface IRedemption extends Document {
  userId: Types.ObjectId;
  rewardId: Types.ObjectId;
  pointsUsed: number;
}