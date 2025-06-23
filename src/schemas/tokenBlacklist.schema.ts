import { z } from "zod";

export const blacklistTokenSchema = z.object({
  token: z.string().min(10),
});
