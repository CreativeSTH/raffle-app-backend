import { Document, Types } from 'mongoose';

export interface IPocket extends Document {
  userId: Types.ObjectId;
  points: number;
}
