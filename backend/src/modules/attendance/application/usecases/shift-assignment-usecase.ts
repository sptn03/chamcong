import { IShiftAssignmentRepository, IShiftRepository, IAttendanceRecordRepository } from '../../domain/repositories';
import { ShiftAssignmentDto, shiftAssignmentToDto, CreateShiftAssignmentDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';
import moment from 'moment';

function getMomentFromInterval(workDate: string, intervalValue: string | Record<string, number>): moment.Moment {
  let hours = 0, minutes = 0, seconds = 0;

  if (typeof intervalValue === 'string') {
    const parts = intervalValue.split(':');
    hours = parseInt(parts[0] || '0', 10);
    minutes = parseInt(parts[1] || '0', 10);
    seconds = parseInt(parts[2] || '0', 10);
  } else if (intervalValue && typeof intervalValue === 'object') {
    hours = (intervalValue as any).hours || 0;
    minutes = (intervalValue as any).minutes || 0;
    seconds = (intervalValue as any).seconds || 0;
  }

  return moment(workDate, 'YYYY-MM-DD')
    .utcOffset('+07:00')
    .startOf('day')
    .add(hours, 'hours')
    .add(minutes, 'minutes')
    .add(seconds, 'seconds');
}

export class ShiftAssignmentUsecase {
  constructor(
    private readonly assignmentRepo: IShiftAssignmentRepository,
    private readonly shiftRepo: IShiftRepository,
    private readonly recordRepo: IAttendanceRecordRepository,
  ) {}

  async create(input: CreateShiftAssignmentDto): Promise<ShiftAssignmentDto> {
    if (!input.shiftId || !input.scopeType || !input.companyId) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    // Validate scope constraints
    if (input.scopeType === 'branch' && !input.branchId) throw new ValidationError('Không tìm thấy chi nhánh');
    if (input.scopeType === 'department' && !input.departmentId) throw new ValidationError('Không tìm thấy phòng ban');
    if (input.scopeType === 'employee' && !input.employeeId) throw new ValidationError('Không tìm thấy nhân viên');

    const entity = await this.assignmentRepo.create(input);
    return shiftAssignmentToDto(entity);
  }

  private async enrichAssignments(entities: any[]): Promise<ShiftAssignmentDto[]> {
    const result: ShiftAssignmentDto[] = [];
    for (const entity of entities) {
      const shift = await this.shiftRepo.findById(entity.shiftId);
      result.push(shiftAssignmentToDto(entity, shift));
    }
    return result;
  }

  async getById(id: number): Promise<ShiftAssignmentDto> {
    const entity = await this.assignmentRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy ca làm việc');
    const shift = await this.shiftRepo.findById(entity.shiftId);
    return shiftAssignmentToDto(entity, shift);
  }

  async getByShift(shiftId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByShiftId(shiftId);
    return this.enrichAssignments(entities);
  }

  async getByEmployee(employeeId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByEmployeeId(employeeId);
    return this.enrichAssignments(entities);
  }

  async getByDepartment(departmentId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByDepartmentId(departmentId);
    return this.enrichAssignments(entities);
  }

  async getByBranch(branchId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByBranchId(branchId);
    return this.enrichAssignments(entities);
  }

  async getByCompany(companyId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByCompanyId(companyId);
    return this.enrichAssignments(entities);
  }

  async getEffective(employeeId: number, date: string): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findEffective(employeeId, date);

    // Chỉ lọc theo giờ hiện tại nếu ngày truy vấn là ngày hôm nay (múi giờ +07:00)
    const todayStr = moment().utcOffset('+07:00').format('YYYY-MM-DD');
    const isToday = date === todayStr;

    // Lấy danh sách các bản ghi chấm công của ngày hôm nay để xem có ca nào đang dở dang (đã checkin nhưng chưa checkout)
    const activeRecords = isToday ? await this.recordRepo.findByEmployeeAndDate(employeeId, date) : [];

    const result: ShiftAssignmentDto[] = [];
    for (const entity of entities) {
      const shift = await this.shiftRepo.findById(entity.shiftId);
      if (!shift) continue;

      if (isToday) {
        // Kiểm tra xem ca này đã check-in nhưng chưa check-out chưa
        const hasUnfinishedCheckin = activeRecords.some(
          r => Number(r.shiftId) === Number(shift.id) && r.checkinAt && !r.checkoutAt
        );

        if (hasUnfinishedCheckin) {
          result.push(shiftAssignmentToDto(entity, shift));
          continue;
        }

        const currentMoment = moment().utcOffset('+07:00');
        // Trích xuất checkin_from và checkout_to sang dạng Moment tương ứng với ngày 'date'
        const checkinFromTime = getMomentFromInterval(date, shift.checkinFrom as any);
        const checkoutToTime = getMomentFromInterval(date, shift.checkoutTo as any);

        if (currentMoment.isSameOrAfter(checkinFromTime) && currentMoment.isSameOrBefore(checkoutToTime)) {
          result.push(shiftAssignmentToDto(entity, shift));
        }
      } else {
        result.push(shiftAssignmentToDto(entity, shift));
      }
    }

    return result;
  }

  async update(id: number, input: CreateShiftAssignmentDto): Promise<ShiftAssignmentDto> {
    if (!input.shiftId || !input.scopeType || !input.companyId) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    if (input.scopeType === 'branch' && !input.branchId) throw new ValidationError('Không tìm thấy chi nhánh');
    if (input.scopeType === 'department' && !input.departmentId) throw new ValidationError('Không tìm thấy phòng ban');
    if (input.scopeType === 'employee' && !input.employeeId) throw new ValidationError('Không tìm thấy nhân viên');

    const existing = await this.assignmentRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy ca làm việc');

    const entity = await this.assignmentRepo.update(id, input);
    return shiftAssignmentToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.assignmentRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy ca làm việc');
    await this.assignmentRepo.softDelete(id);
  }
}
