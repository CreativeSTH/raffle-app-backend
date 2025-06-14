import { Schema, model } from 'mongoose';
import { IReward } from '../interfaces/modelsInterfaces/Reward.interface';

const rewardSchema = new Schema<IReward>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  raffleId: { type: Schema.Types.ObjectId, ref: 'Raffle' },
  pointsUsed: { type: Number, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

export default model<IReward>('Reward', rewardSchema);