import { Document } from 'mongoose';

export interface ILottery {
  _id?: string;
  name: string;
  slug: string;
  gameDays: string[]; // Usamos string porque Mongoose guarda enum como string
  gameTime: string; // HH:mm formato 24h
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}