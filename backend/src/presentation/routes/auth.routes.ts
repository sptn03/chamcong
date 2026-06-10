import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

/**
 * Routes cho Auth
 */
export function createAuthRouter(controller: AuthController, authMiddleware: any): Router {
  const router = Router();

  router.post('/login', controller.login);
  router.post('/hunonic-login', controller.hunonicLogin);
  router.post('/hunonic-password-login', controller.hunonicPasswordLogin);
  router.post('/logout', controller.logout);
  router.post('/switch-company', authMiddleware, controller.switchCompany);

  return router;
}
