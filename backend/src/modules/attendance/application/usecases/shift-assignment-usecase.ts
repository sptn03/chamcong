import { IShiftAssignmentRepository, IShiftRepository } from '../../domain/repositories';
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
  ) {}

  async create(input: CreateShiftAssignmentDto): Promise<ShiftAssignmentDto> {
    if (!input.shiftId || !input.scopeType || !input.companyId) {
      throw new ValidationError('shiftId, scopeType, companyId are required');
    }
    // Validate scope constraints
    if (input.scopeType === 'branch' && !input.branchId) throw new ValidationError('branchId required for branch scope');
    if (input.scopeType === 'department' && !input.departmentId) throw new ValidationError('departmentId required for department scope');
    if (input.scopeType === 'employee' && !input.employeeId) throw new ValidationError('employeeId required for employee scope');

    const entity = await this.assignmentRepo.create(input);
    return shiftAssignmentToDto(entity);
  }

  async getById(id: number): Promise<ShiftAssignmentDto> {
    const entity = await this.assignmentRepo.findById(id);
    if (!entity) throw new NotFoundError('Shift assignment not found');
    return shiftAssignmentToDto(entity);
  }

  async getByShift(shiftId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByShiftId(shiftId);
    return entities.map(shiftAssignmentToDto);
  }

  async getByEmployee(employeeId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByEmployeeId(employeeId);
    return entities.map(shiftAssignmentToDto);
  }

  async getByDepartment(departmentId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByDepartmentId(departmentId);
    return entities.map(shiftAssignmentToDto);
  }

  async getByBranch(branchId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByBranchId(branchId);
    return entities.map(shiftAssignmentToDto);
  }

  async getByCompany(companyId: number): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findByCompanyId(companyId);
    return entities.map(shiftAssignmentToDto);
  }

  async getEffective(employeeId: number, date: string): Promise<ShiftAssignmentDto[]> {
    const entities = await this.assignmentRepo.findEffective(employeeId, date);

    // Chỉ lọc theo giờ hiện tại nếu ngày truy vấn là ngày hôm nay (múi giờ +07:00)
    const todayStr = moment().utcOffset('+07:00').format('YYYY-MM-DD');
    const isToday = date === todayStr;

    if (isToday) {
      const filteredEntities = [];
      const currentMoment = moment().utcOffset('+07:00');

      for (const entity of entities) {
        const shift = await this.shiftRepo.findById(entity.shiftId);
        if (!shift) continue;

        // Trích xuất checkin_from và checkout_to sang dạng Moment tương ứng với ngày 'date'
        const checkinFromTime = getMomentFromInterval(date, shift.checkinFrom as any);
        const checkoutToTime = getMomentFromInterval(date, shift.checkoutTo as any);

        if (currentMoment.isSameOrAfter(checkinFromTime) && currentMoment.isSameOrBefore(checkoutToTime)) {
          filteredEntities.push(entity);
        }
      }
      return filteredEntities.map(shiftAssignmentToDto);
    }

    return entities.map(shiftAssignmentToDto);
  }

  async update(id: number, input: CreateShiftAssignmentDto): Promise<ShiftAssignmentDto> {
    if (!input.shiftId || !input.scopeType || !input.companyId) {
      throw new ValidationError('shiftId, scopeType, companyId are required');
    }
    if (input.scopeType === 'branch' && !input.branchId) throw new ValidationError('branchId required for branch scope');
    if (input.scopeType === 'department' && !input.departmentId) throw new ValidationError('departmentId required for department scope');
    if (input.scopeType === 'employee' && !input.employeeId) throw new ValidationError('employeeId required for employee scope');

    const existing = await this.assignmentRepo.findById(id);
    if (!existing) throw new NotFoundError('Shift assignment not found');

    const entity = await this.assignmentRepo.update(id, input);
    return shiftAssignmentToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.assignmentRepo.findById(id);
    if (!existing) throw new NotFoundError('Shift assignment not found');
    await this.assignmentRepo.softDelete(id);
  }
}
