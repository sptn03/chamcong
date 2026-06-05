import { ShiftAssignment, CreateShiftAssignmentInput } from '../entities';

export interface IShiftAssignmentRepository {
  findById(id: number): Promise<ShiftAssignment | null>;
  findByShiftId(shiftId: number): Promise<ShiftAssignment[]>;
  findByEmployeeId(employeeId: number): Promise<ShiftAssignment[]>;
  findByDepartmentId(departmentId: number): Promise<ShiftAssignment[]>;
  findByBranchId(branchId: number): Promise<ShiftAssignment[]>;
  create(input: CreateShiftAssignmentInput): Promise<ShiftAssignment>;
  softDelete(id: number): Promise<void>;
  /** Get effective shift assignments for an employee on a given date */
  findEffective(employeeId: number, date: string): Promise<ShiftAssignment[]>;
}
