import { Document } from 'mongoose';

export interface ILottery extends Document {
  name: string;
}