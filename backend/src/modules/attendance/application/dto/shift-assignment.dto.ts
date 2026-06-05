import { ShiftAssignment } from '../../domain/entities';

export interface ShiftAssignmentDto {
  id: number;
  shiftId: number;
  scopeType: string;
  companyId: number;
  branchId: number | null;
  departmentId: number | null;
  employeeId: number | null;
  startsOn: string | null;
  endsOn: string | null;
  createdAt: string;
}

export function shiftAssignmentToDto(entity: ShiftAssignment): ShiftAssignmentDto {
  return {
    id: entity.id,
    shiftId: entity.shiftId,
    scopeType: entity.scopeType,
    companyId: entity.companyId,
    branchId: entity.branchId,
    departmentId: entity.departmentId,
    employeeId: entity.employeeId,
    startsOn: entity.startsOn,
    endsOn: entity.endsOn,
    createdAt: entity.createdAt.toISOString(),
  };
}

export interface CreateShiftAssignmentDto {
  shiftId: number;
  scopeType: 'company' | 'branch' | 'department' | 'employee';
  companyId: number;
  branchId?: number;
  departmentId?: number;
  employeeId?: number;
  startsOn?: string;
  endsOn?: string;
}
