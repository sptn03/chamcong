import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';

export function createEmployeeRouter(controller: EmployeeController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/update', controller.update);
  router.post('/delete', controller.delete);

  return router;
}
