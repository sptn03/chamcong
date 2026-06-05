import { Pool, QueryResult } from 'pg';
import { IShiftAssignmentRepository } from '../../../modules/attendance/domain/repositories';
import { ShiftAssignment, CreateShiftAssignmentInput } from '../../../modules/attendance/domain/entities';

interface ShiftAssignmentRow {
  id: number;
  shift_id: number;
  scope_type: string;
  company_id: number;
  branch_id: number | null;
  department_id: number | null;
  employee_id: number | null;
  starts_on: string | null;
  ends_on: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: ShiftAssignmentRow): ShiftAssignment {
  return {
    id: row.id,
    shiftId: row.shift_id,
    scopeType: row.scope_type as ShiftAssignment['scopeType'],
    companyId: row.company_id,
    branchId: row.branch_id,
    departmentId: row.department_id,
    employeeId: row.employee_id,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresShiftAssignmentRepository implements IShiftAssignmentRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<ShiftAssignment | null> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      'SELECT * FROM shift_assignments WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByShiftId(shiftId: number): Promise<ShiftAssignment[]> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      'SELECT * FROM shift_assignments WHERE shift_id = $1 AND deleted_at IS NULL ORDER BY scope_type',
      [shiftId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByEmployeeId(employeeId: number): Promise<ShiftAssignment[]> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      `SELECT sa.* FROM shift_assignments sa WHERE sa.deleted_at IS NULL AND (
        (sa.scope_type = 'employee' AND sa.employee_id = $1)
        OR (sa.scope_type = 'department' AND sa.department_id IN (
          SELECT department_id FROM employees WHERE id = $1))
        OR (sa.scope_type = 'branch' AND sa.branch_id IN (
          SELECT branch_id FROM employees WHERE id = $1))
        OR (sa.scope_type = 'company' AND sa.company_id IN (
          SELECT company_id FROM employees WHERE id = $1))
      )`,
      [employeeId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByDepartmentId(departmentId: number): Promise<ShiftAssignment[]> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      'SELECT * FROM shift_assignments WHERE department_id = $1 AND deleted_at IS NULL',
      [departmentId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByBranchId(branchId: number): Promise<ShiftAssignment[]> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      'SELECT * FROM shift_assignments WHERE branch_id = $1 AND deleted_at IS NULL',
      [branchId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateShiftAssignmentInput): Promise<ShiftAssignment> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      `INSERT INTO shift_assignments
       (shift_id, scope_type, company_id, branch_id, department_id, employee_id, starts_on, ends_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [input.shiftId, input.scopeType, input.companyId,
       input.branchId ?? null, input.departmentId ?? null, input.employeeId ?? null,
       input.startsOn ?? null, input.endsOn ?? null],
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE shift_assignments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }

  async findEffective(employeeId: number, date: string): Promise<ShiftAssignment[]> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      `SELECT DISTINCT ON (sa.id) sa.* FROM shift_assignments sa
       LEFT JOIN employees e ON e.id = $1
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $2)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2)
         AND (
           (sa.scope_type = 'employee' AND sa.employee_id = $1)
           OR (sa.scope_type = 'department' AND sa.department_id = e.department_id)
           OR (sa.scope_type = 'branch' AND sa.branch_id = e.branch_id)
           OR (sa.scope_type = 'company' AND sa.company_id = e.company_id)
         )
       ORDER BY sa.id, sa.scope_type`,
      [employeeId, date],
    );
    return result.rows.map(rowToEntity);
  }
}
