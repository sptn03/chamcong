import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';

export function createDepartmentRouter(controller: DepartmentController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/update', controller.update);
  router.post('/delete', controller.delete);

  return router;
}
