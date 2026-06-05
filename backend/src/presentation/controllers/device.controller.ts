import { Request, Response } from 'express';
import { DeviceUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Device 
 */
export class DeviceController {
  constructor(private readonly deviceUsecase: DeviceUsecase) {}

  /** GET /api/devices?[id=][&userId=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;

    if (id) {
      const result = await this.deviceUsecase.getById(id);
      res.json(ok(result));
    } else if (userId) {
      const result = await this.deviceUsecase.getByUser(userId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/devices/register - Đăng ký thiết bị mới (upsert) */
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.deviceUsecase.register(req.body);
    res.status(201).json(created('Đăng ký thiết bị thành công', result));
  });

  /** POST /api/devices/update-status - Duyệt/từ chối/thu hồi thiết bị */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id, status } = req.body;
    await this.deviceUsecase.updateStatus(id, { status });
    res.json(ok(null, 'Cập nhật trạng thái thiết bị thành công'));
  });
}
