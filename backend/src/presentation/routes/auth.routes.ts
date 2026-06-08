import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

/**
 * Routes cho Auth
 * Login không cần auth middleware (gắn ở app.ts)
 */
export function createAuthRouter(controller: AuthController, authMiddleware: any): Router {
  const router = Router();

  router.post('/login', controller.login);
  router.post('/hunonic-login', controller.hunonicLogin);
  router.post('/logout', controller.logout);
  router.post('/switch-company', authMiddleware, controller.switchCompany);

  return router;
}
