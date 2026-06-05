import { IEmployeeRepository } from '../../domain/repositories';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/entities';
import { EmployeeDto, employeeToDto, CreateEmployeeDto, UpdateEmployeeDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class EmployeeUsecase {
  constructor(private readonly employeeRepo: IEmployeeRepository) {}

  async create(input: CreateEmployeeDto): Promise<EmployeeDto> {
    if (!input.userId || !input.companyId || !input.employeeCode || !input.fullName) {
      throw new ValidationError('Missing required fields');
    }

    const existing = await this.employeeRepo.findByCode(input.companyId, input.employeeCode);
    if (existing) {
      throw new ValidationError('Employee code already exists in this company');
    }

    const entity = await this.employeeRepo.create(input as CreateEmployeeInput);
    return employeeToDto(entity);
  }

  async getById(id: number): Promise<EmployeeDto> {
    const entity = await this.employeeRepo.findById(id);
    if (!entity) throw new NotFoundError('Employee not found');
    return employeeToDto(entity);
  }

  async getByCompany(companyId: number): Promise<EmployeeDto[]> {
    const entities = await this.employeeRepo.findByCompanyId(companyId);
    return entities.map(employeeToDto);
  }

  async update(id: number, input: UpdateEmployeeDto): Promise<EmployeeDto> {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Employee not found');

    const entity = await this.employeeRepo.update(id, input as UpdateEmployeeInput);
    return employeeToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Employee not found');
    await this.employeeRepo.softDelete(id);
  }
}
