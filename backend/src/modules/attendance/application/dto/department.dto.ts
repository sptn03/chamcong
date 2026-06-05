import { Department } from '../../domain/entities';

export interface DepartmentDto {
  id: number;
  companyId: number;
  branchId: number | null;
  name: string;
  createdAt: string;
}

export function departmentToDto(entity: Department): DepartmentDto {
  return {
    id: entity.id,
    companyId: entity.companyId,
    branchId: entity.branchId,
    name: entity.name,
    createdAt: entity.createdAt.toISOString(),
  };
}

export interface CreateDepartmentDto {
  companyId: number;
  branchId?: number;
  name: string;
}

export interface UpdateDepartmentDto {
  branchId?: number;
  name?: string;
}
