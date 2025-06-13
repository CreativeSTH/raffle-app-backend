import { Document, Types } from 'mongoose';

export interface IRaffle extends Document {
  title: string;
  description: string;
  pricePerTicket: number;
  totalTickets: number;
  pointsPercentage: number;
  daysToPay: number;
  companyId: Types.ObjectId;
  lotteryId: Types.ObjectId;
  drawId?: Types.ObjectId;
  winnerTicketId?: Types.ObjectId;
  isAutomaticWinner: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}