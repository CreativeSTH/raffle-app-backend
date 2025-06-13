import { Schema, model } from 'mongoose';
import { IWallet } from '../interfaces/Wallet.interface';

const walletSchema = new Schema<IWallet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
}, { timestamps: true });

export default model<IWallet>('Wallet', walletSchema);