import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';

export function createCompanyRouter(controller: CompanyController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/update', controller.update);
  router.post('/delete', controller.delete);

  return router;
}
