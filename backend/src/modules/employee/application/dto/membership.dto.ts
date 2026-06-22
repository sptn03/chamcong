import { CompanyMembership } from '../../domain/entities';
import { toVNTime } from '../../../../shared/utils/datetime';

export interface MembershipDto {
  id: number;
  userId: number;
  companyId: number;
  employeeId: number | null;
  role: string;
  activeDepartmentId: number | null;
  createdAt: string;
}

export function membershipToDto(entity: CompanyMembership): MembershipDto {
  return {
    id: entity.id,
    userId: entity.userId,
    companyId: entity.companyId,
    employeeId: entity.employeeId,
    role: entity.role,
    activeDepartmentId: entity.activeDepartmentId,
    createdAt: toVNTime(entity.createdAt),
  };
}

export interface CreateMembershipDto {
  userId: number;
  companyId: number;
  employeeId?: number;
  role: 'admin' | 'employee';
  activeDepartmentId?: number;
}
