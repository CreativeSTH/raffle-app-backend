import { Schema, model } from 'mongoose';
import { ICompany } from '../interfaces/Company.interface';

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    logoUrl: { type: String },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    ownerPhone: { type: String, required: true },
  },
  { timestamps: true }
);