import { z } from 'zod';
import { LOTTERY_GAME_DAYS } from '../constants/lotteryGameDays';

const gameDayEnum = z.enum(LOTTERY_GAME_DAYS as [string, ...string[]]);

export const createLotterySchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),

  slug: z.string()
    .min(2, 'El slug es obligatorio')
    .regex(/^[a-z0-9-]+$/, {
      message: 'El slug solo puede contener minúsculas, números y guiones',
    }),

  gameDays: z.union([
    gameDayEnum,
    z.array(gameDayEnum),
  ]).transform((val) => (Array.isArray(val) ? val : [val])),

  gameTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe estar en formato HH:mm (24h)',
  }),

  ID: z.string().optional(),

  isActive: z.boolean().optional().default(true),
});

export const updateLotterySchema = createLotterySchema.partial();
