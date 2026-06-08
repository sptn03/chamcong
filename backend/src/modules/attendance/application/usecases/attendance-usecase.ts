import { Pool } from 'pg';
import {
  IAttendanceRecordRepository,
  IAttendanceEvidenceRepository,
  IShiftRepository,
  IEmployeeRepository,
  IShiftAssignmentRepository,
} from '../../domain/repositories';
import {
  CreateAttendanceRecordInput,
  AttendanceSource,
  UpdateAttendanceRecordInput,
} from '../../domain/entities';
import { AttendanceRecordDto, attendanceRecordToDto, CheckinDto, CheckoutDto, AttendanceFilterDto, evidenceToDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';
import moment from 'moment';

export class AttendanceUsecase {
  constructor(
    private readonly recordRepo: IAttendanceRecordRepository,
    private readonly evidenceRepo: IAttendanceEvidenceRepository,
    private readonly shiftRepo: IShiftRepository,
    private readonly employeeRepo: IEmployeeRepository,
    private readonly shiftAssignmentRepo: IShiftAssignmentRepository,
    private readonly pool: Pool,
  ) {}

  async checkin(input: CheckinDto): Promise<AttendanceRecordDto> {
    // Kiểm tra nhân viên tồn tại
    const employee = await this.employeeRepo.findById(input.employeeId);
    if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');

    // Kiểm tra ca làm tồn tại
    const shift = await this.shiftRepo.findById(input.shiftId);
    if (!shift) throw new NotFoundError('Không tìm thấy ca làm');

    // Kiểm tra đã check-in ca này chưa
    const existingRecords = await this.recordRepo.findByEmployeeAndDate(
      input.employeeId,
      input.workDate,
    );
    if (existingRecords.some(r => r.shiftId === input.shiftId && r.checkinAt)) {
      throw new ValidationError('Đã check-in ca này rồi');
    }

    // Tạo bản ghi công
    const record = await this.recordRepo.create({
      companyId: employee.companyId,
      employeeId: input.employeeId,
      branchId: employee.branchId,
      departmentId: employee.departmentId,
      shiftId: input.shiftId,
      workDate: input.workDate,
      checkinAt: new Date(input.clientTime),
      source: 'online',
    } as CreateAttendanceRecordInput);

    // Tạo evidence check-in
    await this.evidenceRepo.create({
      employeeId: input.employeeId,
      attendanceRecordId: record.id,
      punchType: 'in',
      deviceId: input.deviceId,
      clientTime: new Date(input.clientTime),
      lat: input.lat,
      lng: input.lng,
      accuracyM: input.accuracyM,
      wifiSsid: input.wifiSsid,
      wifiBssid: input.wifiBssid,
      photoPath: input.photoPath,
      note: input.note,
    });

    return attendanceRecordToDto(record);
  }

  async checkout(input: CheckoutDto): Promise<AttendanceRecordDto> {
    const record = await this.recordRepo.findById(input.attendanceRecordId);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    if (record.checkoutAt) throw new ValidationError('Đã check-out rồi');

    const checkinTime = record.checkinAt;
    const checkoutTime = new Date(input.clientTime);
    let actualWorkMinutes = 0;
    if (checkinTime) {
      actualWorkMinutes = Math.max(0, Math.floor((checkoutTime.getTime() - checkinTime.getTime()) / 60000));
    }

    const updated = await this.recordRepo.update(input.attendanceRecordId, {
      checkoutAt: checkoutTime,
      actualWorkMinutes: actualWorkMinutes,
    });

    // Tạo evidence check-out
    await this.evidenceRepo.create({
      employeeId: record.employeeId,
      attendanceRecordId: record.id,
      punchType: 'out',
      deviceId: input.deviceId,
      clientTime: checkoutTime,
      lat: input.lat,
      lng: input.lng,
      accuracyM: input.accuracyM,
      wifiSsid: input.wifiSsid,
      wifiBssid: input.wifiBssid,
      photoPath: input.photoPath,
      note: input.note,
    });

    return attendanceRecordToDto(updated);
  }

  async getById(id: number): Promise<AttendanceRecordDto> {
    const record = await this.recordRepo.findById(id);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    return attendanceRecordToDto(record);
  }

  async getRecords(filter: AttendanceFilterDto) {
    const result = await this.recordRepo.findFiltered(filter);
    return {
      data: result.data.map(attendanceRecordToDto),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getEvidences(recordId: number) {
    const record = await this.recordRepo.findById(recordId);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    const evidences = await this.evidenceRepo.findByRecordId(recordId);
    return evidences.map(evidenceToDto);
  }

  async approve(id: number, approvedBy: number, status: string, rejectionReason?: string): Promise<void> {
    const record = await this.recordRepo.findById(id);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');
    await this.recordRepo.approve(id, approvedBy, status === 'rejected' ? rejectionReason : undefined);
  }

  async edit(input: any, editedBy: number): Promise<AttendanceRecordDto> {
    const { id, reason, ...updateData } = input;
    if (!id || !reason) throw new ValidationError('id và reason là bắt buộc');

    const record = await this.recordRepo.findById(id);
    if (!record) throw new NotFoundError('Không tìm thấy bản ghi công');

    // Lưu log chỉnh sửa
    await this.pool.query(
      `INSERT INTO attendance_edit_logs (attendance_record_id, edited_by, before_json, after_json, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, editedBy, JSON.stringify(record), JSON.stringify(updateData), reason],
    );

    let actualWorkMinutes: number | undefined = undefined;
    const newCheckin = updateData.checkinAt ? new Date(updateData.checkinAt) : record.checkinAt;
    const newCheckout = updateData.checkoutAt ? new Date(updateData.checkoutAt) : record.checkoutAt;
    if (newCheckin && newCheckout) {
      actualWorkMinutes = Math.max(0, Math.floor((newCheckout.getTime() - newCheckin.getTime()) / 60000));
    }

    const updated = await this.recordRepo.update(id, {
      checkinAt: updateData.checkinAt ? new Date(updateData.checkinAt) : undefined,
      checkoutAt: updateData.checkoutAt ? new Date(updateData.checkoutAt) : undefined,
      workStatus: updateData.workStatus,
      lateMin: updateData.lateMin,
      earlyMin: updateData.earlyMin,
      workCredit: updateData.workCredit,
      actualWorkMinutes: actualWorkMinutes,
    });

    return attendanceRecordToDto(updated);
  }
}
