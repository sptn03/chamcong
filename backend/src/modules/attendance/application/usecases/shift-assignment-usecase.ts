import { IShiftAssignmentRepository } from '../../domain/repositories';
import { ShiftAssignmentDto, shiftAssignmentToDto, CreateShiftAssignmentDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class ShiftAssignmentUsecase {
  constructor(private readonly assignmentRepo: IShiftAssignmentRepository) {}

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
