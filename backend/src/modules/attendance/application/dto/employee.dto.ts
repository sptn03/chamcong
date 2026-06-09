import { Employee } from '../../domain/entities';

export interface EmployeeDto {
  id: number;
  userId: number;
  companyId: number;
  branchId: number;
  departmentId: number;
  employeeCode: string;
  title: string | null;
  status: string;
  fullName?: string;
  phone?: string;
  role?: number;
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
    title: entity.title,
    status: entity.status,
    fullName: entity.fullName,
    phone: entity.phone,
    role: entity.role,
    createdAt: entity.createdAt.toISOString(),
  };
}

export interface CreateEmployeeDto {
  userId?: number;
  companyId: number;
  branchId: number;
  departmentId: number;
  employeeCode: string;
  title?: string;
  fullName: string;
  phone: string;
  password?: string;
  email?: string;
  birthday?: string;
  gender?: number;
  role?: number;
}

export interface UpdateEmployeeDto {
  branchId?: number;
  departmentId?: number;
  title?: string;
  status?: string;
  fullName?: string;
  phone?: string;
  password?: string;
  email?: string;
  birthday?: string;
  gender?: number;
  role?: number;
}

