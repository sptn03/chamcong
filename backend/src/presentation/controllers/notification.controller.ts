import { Request, Response } from 'express';
import { NotificationUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Notification 
 */
export class NotificationController {
  constructor(private readonly notifUsecase: NotificationUsecase) {}

  /** GET /api/notifications?[id=][&userId=][&unread=1][&limit=&offset=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : req.userId;
    const unread = req.query.unread as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    if (id) {
      const result = await this.notifUsecase.getById(id);
      res.json(ok(result));
    } else if (userId && unread === '1') {
      const result = await this.notifUsecase.getUnreadByUser(userId);
      res.json(ok(result));
    } else if (userId) {
      const result = await this.notifUsecase.getByUser(userId, limit, offset);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/notifications/read - Đánh dấu đã đọc một thông báo */
  markRead = asyncHandler(async (req: Request, res: Response) => {
    await this.notifUsecase.markAsRead(req.body.id);
    res.json(ok(null, 'Đã đánh dấu đã đọc'));
  });

  /** POST /api/notifications/read-all - Đánh dấu tất cả đã đọc */
  markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.body.userId ? parseInt(req.body.userId as string, 10) : req.userId!;
    await this.notifUsecase.markAllAsRead(userId);
    res.json(ok(null, 'Đã đánh dấu tất cả đã đọc'));
  });
}
