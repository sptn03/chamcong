import { Request, Response } from 'express';
import { DeviceUsecase } from '../../modules/location/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Device 
 */
export class DeviceController {
  constructor(private readonly deviceUsecase: DeviceUsecase) {}

  /** GET /api/devices?[id=][&userId=][&companyId=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : (req.activeCompanyId || undefined);

    if (id) {
      const result = await this.deviceUsecase.getById(id);
      res.json(ok(result));
    } else if (userId) {
      const result = await this.deviceUsecase.getByUser(userId);
      res.json(ok(result));
    } else {
      const result = await this.deviceUsecase.getAll(companyId);
      res.json(ok(result));
    }
  });

  /** POST /api/devices/register - Đăng ký thiết bị mới (upsert) */
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.deviceUsecase.register({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined
    });
    res.status(201).json(created('Đăng ký thiết bị thành công', result));
  });

  /** POST /api/devices/update-status - Duyệt/từ chối/thu hồi thiết bị */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id, status, reviewedBy, rejectionReason } = req.body;
    await this.deviceUsecase.updateStatus(id, { status, reviewedBy, rejectionReason });
    res.json(ok(null, 'Cập nhật trạng thái thiết bị thành công'));
  });
}
