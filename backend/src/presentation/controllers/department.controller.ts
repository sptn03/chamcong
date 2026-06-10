import { Request, Response } from 'express';
import { DepartmentUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Department 
 */
export class DepartmentController {
  constructor(private readonly deptUsecase: DepartmentUsecase) {}

  /** GET /api/departments?[id=][&companyId=][&branchId=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : (req.activeCompanyId || undefined);
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;

    if (id) {
      const result = await this.deptUsecase.getById(id);
      res.json(ok(result));
    } else if (branchId) {
      const result = await this.deptUsecase.getByBranch(branchId);
      res.json(ok(result));
    } else if (companyId) {
      const result = await this.deptUsecase.getByCompany(companyId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/departments/create - Tạo phòng ban mới */
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.deptUsecase.create(req.body);
    res.status(201).json(created('Tạo phòng ban thành công', result));
  });

  /** POST /api/departments/update - Cập nhật phòng ban */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    const result = await this.deptUsecase.update(id, data);
    res.json(ok(result, 'Cập nhật phòng ban thành công'));
  });

  /** POST /api/departments/delete - Xóa mềm phòng ban */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.deptUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa phòng ban thành công'));
  });
}
