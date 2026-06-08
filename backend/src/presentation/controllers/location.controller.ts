import { Request, Response } from 'express';
import { LocationUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Location 
 */
export class LocationController {
  constructor(private readonly locationUsecase: LocationUsecase) {}

  /** GET /api/locations?[id=][&companyId=][&branchId=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : (req.activeCompanyId || undefined);
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;

    if (id) {
      const result = await this.locationUsecase.getById(id);
      res.json(ok(result));
    } else if (branchId) {
      const result = await this.locationUsecase.getByBranch(branchId);
      res.json(ok(result));
    } else if (companyId) {
      const result = await this.locationUsecase.getByCompany(companyId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/locations/create - Tạo địa điểm chấm công GPS */
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.locationUsecase.create(req.body);
    res.status(201).json(created('Tạo địa điểm thành công', result));
  });

  /** POST /api/locations/update - Cập nhật địa điểm */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    const result = await this.locationUsecase.update(id, data);
    res.json(ok(result, 'Cập nhật địa điểm thành công'));
  });

  /** POST /api/locations/delete - Xóa mềm địa điểm */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.locationUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa địa điểm thành công'));
  });
}
