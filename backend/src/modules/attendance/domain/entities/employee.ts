export type EmployeeStatus = 'active' | 'locked';
export type GenderType = 'male' | 'female' | 'other';

export interface Employee {
  id: number;
  userId: number;
  companyId: number;
  branchId: number;
  departmentId: number;
  employeeCode: string;
  fullName: string;
  birthday: string | null;
  gender: GenderType | null;
  title: string | null;
  status: EmployeeStatus;
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
  fullName: string;
  birthday?: string;
  gender?: GenderType;
  title?: string;
}

export interface UpdateEmployeeInput {
  branchId?: number;
  departmentId?: number;
  fullName?: string;
  birthday?: string;
  gender?: GenderType;
  title?: string;
  status?: EmployeeStatus;
}
