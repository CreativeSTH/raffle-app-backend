import mongoose, { Schema, Document } from "mongoose";
import { ITokenBlacklist } from "../interfaces/modelsInterfaces/TokenBlacklist-interface";

interface TokenBlacklistDocument extends ITokenBlacklist, Document {}

const TokenBlacklistSchema = new Schema<TokenBlacklistDocument>({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// Eliminación automática al expirar
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = mongoose.model<TokenBlacklistDocument>(
  "TokenBlacklist",
  TokenBlacklistSchema
);
