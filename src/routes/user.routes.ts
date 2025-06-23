import express from 'express';
import { updateOtpPreference, changePassword, logout } from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validateBody';
import { updateOtpPreferenceSchema, changePasswordSchema } from '../schemas/user.schema';
import { blacklistTokenSchema } from '../schemas/tokenBlacklist.schema';
const router = express.Router();

router.patch('/otp-preference', authMiddleware, validateBody(updateOtpPreferenceSchema), updateOtpPreference);
router.patch('/change-password', authMiddleware, validateBody(changePasswordSchema), changePassword);
router.post('/logout', authMiddleware,  logout);
export default router;
