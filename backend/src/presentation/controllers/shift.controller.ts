import { Request, Response } from 'express';
import { ShiftUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Shift 
 */
export class ShiftController {
  constructor(private readonly shiftUsecase: ShiftUsecase) {}

  /** GET /api/shifts?[id=][&companyId=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : (req.activeCompanyId || undefined);

    if (id) {
      const result = await this.shiftUsecase.getById(id);
      res.json(ok(result));
    } else if (companyId) {
      const result = await this.shiftUsecase.getByCompany(companyId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/shifts/create - Tạo ca làm mới */
  create = asyncHandler(async (req: Request, res: Response) => {
    if (req.body && req.body.companyId === undefined && req.activeCompanyId) {
      req.body.companyId = req.activeCompanyId;
    }
    const result = await this.shiftUsecase.create(req.body);
    res.status(201).json(created('Tạo ca làm thành công', result));
  });

  /** POST /api/shifts/update - Cập nhật ca làm */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    const result = await this.shiftUsecase.update(id, data);
    res.json(ok(result, 'Cập nhật ca làm thành công'));
  });

  /** POST /api/shifts/delete - Xóa mềm ca làm */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.shiftUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa ca làm thành công'));
  });
}
