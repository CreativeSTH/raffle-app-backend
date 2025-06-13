import { Schema, model } from 'mongoose';
import { IRaffle } from '../interfaces/Raffle.interface';

const raffleSchema = new Schema<IRaffle>(
  {
    title: { type: String, required: true },
    description: { type: String },
    pricePerTicket: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    pointsPercentage: { type: Number, default: 0 },
    daysToPay: { type: Number, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    lotteryId: { type: Schema.Types.ObjectId, ref: 'Lottery', required: true },
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw' },
    winnerTicketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    isAutomaticWinner: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IRaffle>('Raffle', raffleSchema);