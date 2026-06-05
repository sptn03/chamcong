import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

export function createNotificationRouter(controller: NotificationController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/read', controller.markRead);
  router.post('/read-all', controller.markAllRead);

  return router;
}
