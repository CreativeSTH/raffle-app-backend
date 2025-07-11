// src/routes/lottery.routes.ts
import { Router } from 'express';
import { createLottery } from '../controllers/lotteryController';
import { validateBody } from '../middlewares/validateBody';
import { createLotterySchema } from '../schemas/lottery.schema';
import { hasRole } from '../middlewares/accesHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/userRoles';

const router = Router();
//Crear una Lotería
router.post('/', authMiddleware, hasRole( UserRole.HOST UserRole.ADMIN, UserRole.SUPERADMIN ), validateBody(createLotterySchema), createLottery);

export default router;