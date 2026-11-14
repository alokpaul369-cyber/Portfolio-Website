import { Router } from 'express';
import {
  changeEmail,
  changePassword,
  getCurrentAdmin,
  login,
  logout,
  revokeOtherSessions,
} from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { changeEmailSchema, changePasswordSchema } from '../validators/authSchemas.js';
import protect from '../middleware/protect.js';
import { loginLimiter } from '../middleware/rateLimiters.js';

/**
 * Admin authentication routes, mounted at /api/auth.
 * There is intentionally no signup route: the single admin account is created
 * with the seed script (npm run seed:admin -w server).
 */
const router = Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentAdmin);

// Account management. The login limiter also slows down password guessing here.
router.put(
  '/password',
  protect,
  loginLimiter,
  validate({ body: changePasswordSchema }),
  changePassword,
);
router.put('/email', protect, loginLimiter, validate({ body: changeEmailSchema }), changeEmail);
router.post('/sessions/revoke', protect, revokeOtherSessions);

export default router;
