import { Request, Response } from 'express';
import { MembershipUsecase } from '../../modules/employee/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho CompanyMembership 
 */
export class MembershipController {
  constructor(private readonly membershipUsecase: MembershipUsecase) {}

  /** GET /api/memberships?[id=][&userId=][&companyId=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : (req.userId || undefined);
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : undefined;

    if (id) {
      const result = await this.membershipUsecase.getById(id);
      res.json(ok(result));
    } else if (userId) {
      const result = await this.membershipUsecase.getByUser(userId);
      res.json(ok(result));
    } else if (companyId) {
      const result = await this.membershipUsecase.getByCompany(companyId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/memberships/create - Thêm user vào công ty */
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.membershipUsecase.create(req.body);
    res.status(201).json(created('Thêm thành viên thành công', result));
  });

  /** POST /api/memberships/delete - Gỡ user khỏi công ty */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.membershipUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa thành viên thành công'));
  });
}
