import { Router } from 'express';
import { WifiController } from '../controllers/wifi.controller';

export function createWifiRouter(controller: WifiController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/create', controller.create);
  router.post('/update', controller.update);
  router.post('/delete', controller.delete);

  return router;
}
