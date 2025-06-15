import express from 'express';
import { updateOtpPreference } from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validateBody';
import { updateOtpPreferenceSchema } from '../schemas/user.schema';

const router = express.Router();

router.patch('/otp-preference', authMiddleware, validateBody(updateOtpPreferenceSchema), updateOtpPreference);

export default router;
