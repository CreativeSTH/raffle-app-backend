import { TokenBlacklist } from "../models/TokenBlacklist.model";
import jwt from "jsonwebtoken";

export const addToBlacklist = async (token: string) => {
  const decoded: any = jwt.decode(token);
  if (!decoded?.exp) throw new Error("Token inválido");

  const expiresAt = new Date(decoded.exp * 1000);

  await TokenBlacklist.create({ token, expiresAt });
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const exists = await TokenBlacklist.findOne({ token });
  return !!exists;
};
