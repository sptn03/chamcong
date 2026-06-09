export type EmployeeStatus = 'active' | 'locked';

export interface Employee {
  id: number;
  userId: number;
  companyId: number;
  branchId: number;
  departmentId: number;
  employeeCode: string;
  title: string | null;
  status: EmployeeStatus;
  fullName?: string;
  phone?: string;
  role?: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeInput {
  userId: number;
  companyId: number;
  branchId: number;
  departmentId: number;
  employeeCode: string;
  title?: string;
}

export interface UpdateEmployeeInput {
  branchId?: number;
  departmentId?: number;
  title?: string;
  status?: EmployeeStatus;
}
