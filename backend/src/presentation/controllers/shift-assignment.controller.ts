import { Request, Response } from 'express';
import { ShiftAssignmentUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho ShiftAssignment 
 */
export class ShiftAssignmentController {
  constructor(private readonly assignUsecase: ShiftAssignmentUsecase) {}

  /** GET /api/shift-assignments?[id=][&shiftId=][&employeeId=][&departmentId=][&branchId=][&employeeId=&date=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
    const shiftId = req.query.shiftId ? parseInt(req.query.shiftId as string, 10) : undefined;
    const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string, 10) : (req.activeEmployeeId || undefined);
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined;
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
    const date = req.query.date as string | undefined;

    if (id) {
      const result = await this.assignUsecase.getById(id);
      res.json(ok(result));
    } else if (employeeId && date) {
      // Tra cứu ca hiệu lực cho nhân viên theo ngày
      const result = await this.assignUsecase.getEffective(employeeId, date);
      res.json(ok(result));
    } else if (employeeId) {
      const result = await this.assignUsecase.getByEmployee(employeeId);
      res.json(ok(result));
    } else if (departmentId) {
      const result = await this.assignUsecase.getByDepartment(departmentId);
      res.json(ok(result));
    } else if (branchId) {
      const result = await this.assignUsecase.getByBranch(branchId);
      res.json(ok(result));
    } else if (shiftId) {
      const result = await this.assignUsecase.getByShift(shiftId);
      res.json(ok(result));
    } else {
      res.json(ok([]));
    }
  });

  /** POST /api/shift-assignments/create - Gán ca */
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.assignUsecase.create(req.body);
    res.status(201).json(created('Gán ca thành công', result));
  });

  /** POST /api/shift-assignments/delete - Xóa gán ca */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.assignUsecase.delete(req.body.id);
    res.json(ok(null, 'Xóa gán ca thành công'));
  });
}
