import { Schema, model } from 'mongoose';
import { ITicket } from '../interfaces/Ticket.interface';

const ticketSchema = new Schema<ITicket>({
  raffleId: { type: Schema.Types.ObjectId, ref: 'Raffle', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  number: { type: Number, required: true },
  status: { type: String, enum: ['reserved', 'paid'], default: 'reserved' },
  reservedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
}, { timestamps: true });

export default model<ITicket>('Ticket', ticketSchema);