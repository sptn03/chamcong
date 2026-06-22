import { ShiftAssignment, Shift } from '../../domain/entities';
import { toVNTime } from '../../../../shared/utils/datetime';
import { ShiftDto, shiftToDto } from './shift.dto';

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
  shift?: ShiftDto;
}

export function shiftAssignmentToDto(entity: ShiftAssignment, shiftEntity?: Shift | null): ShiftAssignmentDto {
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
    createdAt: toVNTime(entity.createdAt),
    shift: shiftEntity ? shiftToDto(shiftEntity) : undefined,
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
