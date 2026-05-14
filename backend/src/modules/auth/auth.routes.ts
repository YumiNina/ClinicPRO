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

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/google', googleLoginUrl);
router.post('/google/session', googleSession);
router.post('/google/receptionist', registerGoogleReceptionist);
router.get('/me', authMiddleware, me);

export default router;
