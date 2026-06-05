export interface Department {
  id: number;
  companyId: number;
  branchId: number | null;
  name: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentInput {
  companyId: number;
  branchId?: number;
  name: string;
}

export interface UpdateDepartmentInput {
  branchId?: number;
  name?: string;
}
