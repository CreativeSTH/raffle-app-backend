import { Schema, model } from 'mongoose';
import { IRedemption } from '../interfaces/modelsInterfaces/Redemption.interface';

const redemptionSchema = new Schema<IRedemption>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rewardId: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
    pointsUsed: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model<IRedemption>('Redemption', redemptionSchema);
