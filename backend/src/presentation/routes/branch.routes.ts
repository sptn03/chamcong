import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';

export function createBranchRouter(controller: BranchController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/update', controller.update);
  router.post('/delete', controller.delete);

  return router;
}
