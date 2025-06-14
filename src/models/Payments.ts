import { Schema, model } from 'mongoose';
import { IPayment } from '../interfaces/modelsInterfaces/Payment.interface';

const paymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, enum: ['Wompi', 'ePayco', 'Crypto'], required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

export default model<IPayment>('Payment', paymentSchema);