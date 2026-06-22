import { Request, Response } from 'express';
import { EmployeeUsecase } from '../../modules/employee/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Employee 
 */
export class EmployeeController {
  constructor(private readonly employeeUsecase: EmployeeUsecase) {}

  /** GET /api/employees?[id=][&companyId=] - DS nhân viên hoặc chi tiết */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : (req.activeCompanyId || undefined);

    if (id) {
      const result = await this.employeeUsecase.getById(id);
      res.json(ok(result));
    } else if (companyId) {
      const result = await this.employeeUsecase.getByCompany(companyId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/employees/create - Tạo nhân viên mới */
  create = asyncHandler(async (req: Request, res: Response) => {
    if (req.body && req.body.companyId === undefined && req.activeCompanyId) {
      req.body.companyId = req.activeCompanyId;
    }
    const result = await this.employeeUsecase.create(req.body);
    res.status(201).json(created('Tạo nhân viên thành công', result));
  });

  /** POST /api/employees/update - Cập nhật nhân viên */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    const result = await this.employeeUsecase.update(id, data);
    res.json(ok(result, 'Cập nhật nhân viên thành công'));
  });

  /** POST /api/employees/delete - Xóa mềm nhân viên */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.employeeUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa nhân viên thành công'));
  });
}
