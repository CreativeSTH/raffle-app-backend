// src/routes/lottery.routes.ts
import { Router } from 'express';
import { createLottery, getLotteries, updateLottery, deleteLottery, bulkCreateLotteries, getLotteryById, bulkUploadLotteriesFromFile  } from '../controllers/lotteryController';
import { validateBody } from '../middlewares/validateBody';
import { validateParams } from '../middlewares/validateParams';
import { createLotterySchema, updateLotterySchema, idParamSchema, bulkCreateLotterySchema } from '../schemas/lottery.schema';
import { hasRole } from '../middlewares/accesHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/userRoles';
import { upload } from '../middlewares/upload';

const router = Router();
//Crear una Lotería
router.post(
    '/', 
    authMiddleware, 
    hasRole( UserRole.ADMIN, UserRole.SUPERADMIN ), 
    validateBody(createLotterySchema), 
    createLottery
);

//Crear Loterias objeto JSON
router.post(
  '/bulk',
  authMiddleware,
  hasRole( UserRole.ADMIN, UserRole.SUPERADMIN ),
  validateBody(bulkCreateLotterySchema),
  bulkCreateLotteries
);

//Crear Loterias Archivo JSON upload
router.post(
  '/upload-json',
  authMiddleware,
  hasRole( UserRole.ADMIN, UserRole.SUPERADMIN ),
  upload.single('file'), // campo "file" en el formulario
  bulkUploadLotteriesFromFile
);

// Obtener todas las loterías
router.get(
  '/',
  authMiddleware,
  hasRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HOST, UserRole.USER),
  getLotteries
);

// Obtener una lotería por ID
router.get(
  '/:id',
  authMiddleware,
  hasRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HOST, UserRole.USER),
  validateParams(idParamSchema),
  getLotteryById
);

// Actualizar una lotería
router.put(
  '/:id',
  authMiddleware,
  hasRole(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HOST),
  validateParams(idParamSchema),
  validateBody(updateLotterySchema),
  updateLottery
);

// Eliminar una lotería
router.delete(
  '/:id',
  authMiddleware,
  hasRole(UserRole.ADMIN, UserRole.SUPERADMIN),
  validateParams(idParamSchema),
  deleteLottery
);

export default router;