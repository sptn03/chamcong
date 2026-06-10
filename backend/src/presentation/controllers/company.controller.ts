import { Request, Response } from 'express';
import { CompanyUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Company 
 */
export class CompanyController {
  constructor(private readonly companyUsecase: CompanyUsecase) {}

  /** GET /api/companies?[id=] - Lấy danh sách hoặc chi tiết */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    if (id) {
      const result = await this.companyUsecase.getById(id);
      res.json(ok(result));
    } else {
      const result = await this.companyUsecase.getAll();
      res.json(ok(result));
    }
  });

  /** POST /api/companies/create - Tạo công ty mới */
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.companyUsecase.create(req.body, req.userId);
    res.status(201).json(created('Tạo công ty thành công', result));
  });

  /** POST /api/companies/update - Cập nhật công ty */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    const result = await this.companyUsecase.update(id, data);
    res.json(ok(result, 'Cập nhật công ty thành công'));
  });

  /** POST /api/companies/delete - Xóa mềm công ty */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.companyUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa công ty thành công'));
  });
}
