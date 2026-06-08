import { Request, Response } from 'express';
import { AttendanceUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok, created } from '../helpers/response';

/**
 * Controller cho Attendance - chỉ dùng GET (query) và POST (body)
 */
export class AttendanceController {
  constructor(private readonly attendanceUsecase: AttendanceUsecase) {}

  /** GET /api/attendance?[id=][&companyId=][&employeeId=][&branchId=][&departmentId=][&fromDate=][&toDate=][&approvalStatus=][&page=][&limit=] */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;

    if (id) {
      const result = await this.attendanceUsecase.getById(id);
      res.json(ok(result));
      return;
    }

    const filter = {
      companyId: req.query.companyId ? parseInt(req.query.companyId as string, 10) : (req.activeCompanyId || undefined),
      employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string, 10) : (req.activeEmployeeId || undefined),
      branchId: req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined,
      departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined,
      fromDate: req.query.fromDate as string | undefined,
      toDate: req.query.toDate as string | undefined,
      approvalStatus: req.query.approvalStatus as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };
    const result = await this.attendanceUsecase.getRecords(filter);
    res.json(ok({
      items: result.data,
      pagination: result.pagination,
    }));
  });

  /** GET /api/attendance/evidences?recordId= - Lấy danh sách bằng chứng chấm công */
  getEvidences = asyncHandler(async (req: Request, res: Response) => {
    const recordId = parseInt(req.query.recordId as string, 10);
    const result = await this.attendanceUsecase.getEvidences(recordId);
    res.json(ok(result));
  });

  /** POST /api/attendance/checkin - Check-in */
  checkin = asyncHandler(async (req: Request, res: Response) => {
    if (req.activeEmployeeId && !req.body.employeeId) {
      req.body.employeeId = req.activeEmployeeId;
    }
    const result = await this.attendanceUsecase.checkin(req.body);
    res.status(201).json(created('Check-in thành công', result));
  });

  /** POST /api/attendance/checkout - Check-out */
  checkout = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.attendanceUsecase.checkout(req.body);
    res.json(ok(result, 'Check-out thành công'));
  });

  /** POST /api/attendance/approve - Admin duyệt/từ chối bản ghi công */
  approve = asyncHandler(async (req: Request, res: Response) => {
    const { id, status, rejectionReason } = req.body;
    const approvedBy = req.userId!;
    await this.attendanceUsecase.approve(id, approvedBy, status, rejectionReason);
    res.json(ok(null, 'Xử lý duyệt công thành công'));
  });

  /** POST /api/attendance/edit - Admin sửa bản ghi công (có ghi log) */
  edit = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.attendanceUsecase.edit(req.body, req.userId!);
    res.json(ok(result, 'Sửa công thành công'));
  });
}
