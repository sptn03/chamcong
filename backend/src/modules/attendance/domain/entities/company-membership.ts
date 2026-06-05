export type MembershipRole = 'admin' | 'employee';

export interface CompanyMembership {
  id: number;
  userId: number;
  companyId: number;
  employeeId: number | null;
  role: MembershipRole;
  activeDepartmentId: number | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMembershipInput {
  userId: number;
  companyId: number;
  employeeId?: number;
  role: MembershipRole;
  activeDepartmentId?: number;
}
