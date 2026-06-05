import { Employee } from '../../domain/entities';

export interface EmployeeDto {
  id: number;
  userId: number;
  companyId: number;
  branchId: number;
  departmentId: number;
  employeeCode: string;
  fullName: string;
  birthday: string | null;
  gender: string | null;
  title: string | null;
  status: string;
  createdAt: string;
}

export function employeeToDto(entity: Employee): EmployeeDto {
  return {
    id: entity.id,
    userId: entity.userId,
    companyId: entity.companyId,
    branchId: entity.branchId,
    departmentId: entity.departmentId,
    employeeCode: entity.employeeCode,
    fullName: entity.fullName,
    birthday: entity.birthday,
    gender: entity.gender,
    title: entity.title,
    status: entity.status,
    createdAt: entity.createdAt.toISOString(),
  };
}

export interface CreateEmployeeDto {
  userId: number;
  companyId: number;
  branchId: number;
  departmentId: number;
  employeeCode: string;
  fullName: string;
  birthday?: string;
  gender?: string;
  title?: string;
}

export interface UpdateEmployeeDto {
  branchId?: number;
  departmentId?: number;
  fullName?: string;
  birthday?: string;
  gender?: string;
  title?: string;
  status?: string;
}
