import { Router } from 'express';
import { ShiftAssignmentController } from '../controllers/shift-assignment.controller';

export function createShiftAssignmentRouter(controller: ShiftAssignmentController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/delete', controller.delete);

  return router;
}
