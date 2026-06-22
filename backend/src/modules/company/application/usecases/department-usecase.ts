import { IDepartmentRepository } from '../../domain/repositories';
import { DepartmentDto, departmentToDto, CreateDepartmentDto, UpdateDepartmentDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class DepartmentUsecase {
  constructor(private readonly deptRepo: IDepartmentRepository) {}

  async create(input: CreateDepartmentDto): Promise<DepartmentDto> {
    if (!input.companyId || !input.name) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    const entity = await this.deptRepo.create(input);
    return departmentToDto(entity);
  }

  async getById(id: number): Promise<DepartmentDto> {
    const entity = await this.deptRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy phòng ban');
    return departmentToDto(entity);
  }

  async getByCompany(companyId: number): Promise<DepartmentDto[]> {
    const entities = await this.deptRepo.findByCompanyId(companyId);
    return entities.map(departmentToDto);
  }

  async getByBranch(branchId: number): Promise<DepartmentDto[]> {
    const entities = await this.deptRepo.findByBranchId(branchId);
    return entities.map(departmentToDto);
  }

  async update(id: number, input: UpdateDepartmentDto): Promise<DepartmentDto> {
    const existing = await this.deptRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy phòng ban');
    const entity = await this.deptRepo.update(id, input);
    return departmentToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.deptRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy phòng ban');
    await this.deptRepo.softDelete(id);
  }
}
