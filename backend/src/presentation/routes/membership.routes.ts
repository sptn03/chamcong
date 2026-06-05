import { Router } from 'express';
import { MembershipController } from '../controllers/membership.controller';

export function createMembershipRouter(controller: MembershipController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/delete', controller.delete);

  return router;
}
