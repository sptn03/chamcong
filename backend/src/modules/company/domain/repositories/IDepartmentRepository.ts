import { Department, CreateDepartmentInput, UpdateDepartmentInput } from '../entities';

export interface IDepartmentRepository {
  findById(id: number): Promise<Department | null>;
  findByCompanyId(companyId: number): Promise<Department[]>;
  findByBranchId(branchId: number): Promise<Department[]>;
  create(input: CreateDepartmentInput): Promise<Department>;
  update(id: number, input: UpdateDepartmentInput): Promise<Department>;
  softDelete(id: number): Promise<void>;
}
