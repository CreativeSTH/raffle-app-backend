import { Types } from 'mongoose';

export interface ICompany {
  _id?: Types.ObjectId;
  name: string;
  logoUrl: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt?: Date;
  updatedAt?: Date;
}