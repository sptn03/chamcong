import { Request, Response } from 'express';
import { WifiUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Wifi 
 */
export class WifiController {
  constructor(private readonly wifiUsecase: WifiUsecase) {}

  /** GET /api/wifis?[id=][&companyId=][&branchId=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : undefined;
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;

    if (id) {
      const result = await this.wifiUsecase.getById(id);
      res.json(ok(result));
    } else if (branchId) {
      const result = await this.wifiUsecase.getByBranch(branchId);
      res.json(ok(result));
    } else if (companyId) {
      const result = await this.wifiUsecase.getByCompany(companyId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/wifis/create - Thêm wifi được phép chấm công */
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.wifiUsecase.create(req.body);
    res.status(201).json(created('Thêm wifi thành công', result));
  });

  /** POST /api/wifis/update - Cập nhật wifi */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    const result = await this.wifiUsecase.update(id, data);
    res.json(ok(result, 'Cập nhật wifi thành công'));
  });

  /** POST /api/wifis/delete - Xóa mềm wifi */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.wifiUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa wifi thành công'));
  });
}
