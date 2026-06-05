import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';

export function createDeviceRouter(controller: DeviceController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.post('/register', controller.register);
  router.post('/update-status', controller.updateStatus);

  return router;
}
