import { Router } from 'express';
import { ShiftController } from '../controllers/shift.controller';

export function createShiftRouter(controller: ShiftController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/update', controller.update);
  router.post('/delete', controller.delete);

  return router;
}
