import { Request, Response } from 'express';
import { BranchUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Branch 
 */
export class BranchController {
  constructor(private readonly branchUsecase: BranchUsecase) {}

  /** GET /api/branches?[id=][&companyId=] - DS chi nhánh hoặc chi tiết */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : (req.activeCompanyId || undefined);

    if (id) {
      const result = await this.branchUsecase.getById(id);
      res.json(ok(result));
    } else if (companyId) {
      const result = await this.branchUsecase.getByCompany(companyId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/branches/create - Tạo chi nhánh mới */
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.branchUsecase.create(req.body);
    res.status(201).json(created('Tạo chi nhánh thành công', result));
  });

  /** POST /api/branches/update - Cập nhật chi nhánh */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    const result = await this.branchUsecase.update(id, data);
    res.json(ok(result, 'Cập nhật chi nhánh thành công'));
  });

  /** POST /api/branches/delete - Xóa mềm chi nhánh */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.branchUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa chi nhánh thành công'));
  });
}
