import { Router } from 'express';
import {
  getProfile,
  login,
  logout,
  recoverPassword,
  register,
} from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/roleMiddleware.js';

const router = Router();

// ==========================================
// RUTAS PÚBLICAS (Sin autenticación)
// ==========================================

// Iniciar sesión
router.post('/login', login);

// Registrarse
router.post('/register', register);

// Recuperar contraseña
router.post('/recover-password', recoverPassword);

// ==========================================
// RUTAS PROTEGIDAS (Con autenticación)
// ==========================================

// Obtener perfil (cualquier usuario logueado)
router.get('/profile', authMiddleware, getProfile);

// Logout (cualquier usuario logueado)
router.post('/logout', authMiddleware, logout);

// ==========================================
// RUTAS POR ROL
// ==========================================

// Solo ADMIN
router.get(
  '/admin/users',
  authMiddleware,
  requireRole(['ADMIN']),
  (req, res) => {
    res.json({ success: true, message: 'Acceso a gestión de usuarios' });
  },
);

export default router;
