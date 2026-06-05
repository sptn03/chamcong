import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';

export function createLocationRouter(controller: LocationController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/update', controller.update);
  router.post('/delete', controller.delete);

  return router;
}
