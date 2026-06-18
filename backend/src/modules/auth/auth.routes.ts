import { Router } from 'express';

import {
  login,
  logout,
  googleLoginUrl,
  googleSession,
  me,
  refresh,
  register,
  registerGoogleReceptionist,
} from './auth.controller';

import { authMiddleware } from '../../middleware/auth.middleware';
import { createRateLimitMiddleware } from '../../middleware/security.middleware';

const router = Router();

const authRateLimit = createRateLimitMiddleware({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 30,
});
const loginRateLimit = createRateLimitMiddleware({
  name: 'auth-login',
  windowMs: 15 * 60 * 1000,
  max: 10,
});

router.post('/register', authRateLimit, register);
router.post('/login', loginRateLimit, login);
router.post('/refresh', authRateLimit, refresh);
router.post('/logout', authRateLimit, logout);
router.get('/google', authRateLimit, googleLoginUrl);
router.post('/google/session', loginRateLimit, googleSession);
router.post('/google/receptionist', authRateLimit, registerGoogleReceptionist);
router.get('/me', authMiddleware, me);

export default router;
