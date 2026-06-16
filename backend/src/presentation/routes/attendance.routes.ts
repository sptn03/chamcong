import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';

export function createAttendanceRouter(controller: AttendanceController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/evidences', controller.getEvidences);
  router.post('/checkin', controller.checkin);
  router.post('/checkout', controller.checkout);
  router.post('/approve', controller.approve);
  router.post('/edit', controller.edit);
  router.get('/calendar', controller.getCalendar);

  return router;
}
