export type ShiftAssignmentScope = 'company' | 'branch' | 'department' | 'employee';

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  scopeType: ShiftAssignmentScope;
  companyId: number;
  branchId: number | null;
  departmentId: number | null;
  employeeId: number | null;
  startsOn: string | null;
  endsOn: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShiftAssignmentInput {
  shiftId: number;
  scopeType: ShiftAssignmentScope;
  companyId: number;
  branchId?: number;
  departmentId?: number;
  employeeId?: number;
  startsOn?: string;
  endsOn?: string;
}
