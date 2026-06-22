import { Pool, QueryResult } from 'pg';
import { IShiftAssignmentRepository } from '../../../modules/shift/domain/repositories';
import { ShiftAssignment, CreateShiftAssignmentInput } from '../../../modules/shift/domain/entities';
import {
  SHIFT_ASSIGNMENT_SCOPE_COMPANY,
  SHIFT_ASSIGNMENT_SCOPE_BRANCH,
  SHIFT_ASSIGNMENT_SCOPE_DEPARTMENT,
  SHIFT_ASSIGNMENT_SCOPE_EMPLOYEE,
} from '../../../shared/constants';

interface ShiftAssignmentRow {
  id: number;
  shift_id: number;
  scope_type: number;
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

const SCOPE_MAP: Record<number, string> = { 1: 'company', 2: 'branch', 3: 'department', 4: 'employee' };
const SCOPE_DB: Record<string, number> = { company: 1, branch: 2, department: 3, employee: 4 };

function rowToEntity(row: ShiftAssignmentRow): ShiftAssignment {
  return {
    id: row.id,
    shiftId: row.shift_id,
    scopeType: SCOPE_MAP[row.scope_type] as ShiftAssignment['scopeType'],
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
        (sa.scope_type = $2 AND sa.employee_id = $1)
        OR (sa.scope_type = $3 AND sa.department_id IN (
          SELECT department_id FROM employees WHERE id = $1))
        OR (sa.scope_type = $4 AND sa.branch_id IN (
          SELECT branch_id FROM employees WHERE id = $1))
        OR (sa.scope_type = $5 AND sa.company_id IN (
          SELECT company_id FROM employees WHERE id = $1))
      )`,
      [employeeId, SHIFT_ASSIGNMENT_SCOPE_EMPLOYEE, SHIFT_ASSIGNMENT_SCOPE_DEPARTMENT,
       SHIFT_ASSIGNMENT_SCOPE_BRANCH, SHIFT_ASSIGNMENT_SCOPE_COMPANY],
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

  async findByCompanyId(companyId: number): Promise<ShiftAssignment[]> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      'SELECT * FROM shift_assignments WHERE company_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateShiftAssignmentInput): Promise<ShiftAssignment> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      `INSERT INTO shift_assignments
       (shift_id, scope_type, company_id, branch_id, department_id, employee_id, starts_on, ends_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [input.shiftId, SCOPE_DB[input.scopeType], input.companyId,
       input.branchId ?? null, input.departmentId ?? null, input.employeeId ?? null,
       input.startsOn ?? null, input.endsOn ?? null],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: CreateShiftAssignmentInput): Promise<ShiftAssignment> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      `UPDATE shift_assignments
       SET shift_id = $2, scope_type = $3, company_id = $4, branch_id = $5, department_id = $6, employee_id = $7, starts_on = $8, ends_on = $9, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id, input.shiftId, SCOPE_DB[input.scopeType], input.companyId,
       input.branchId ?? null, input.departmentId ?? null, input.employeeId ?? null,
       input.startsOn ?? null, input.endsOn ?? null],
    );
    if (!result.rows.length) {
      throw new Error('Shift assignment not found');
    }
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
      `SELECT sa.* FROM shift_assignments sa
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $2::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $3 AND sa.employee_id = $1
       UNION ALL
       SELECT sa.* FROM shift_assignments sa
       JOIN employees e ON e.id = $1
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $2::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $4 AND sa.department_id = e.department_id
       UNION ALL
       SELECT sa.* FROM shift_assignments sa
       JOIN employees e ON e.id = $1
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $2::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $5 AND sa.branch_id = e.branch_id
       UNION ALL
       SELECT sa.* FROM shift_assignments sa
       JOIN employees e ON e.id = $1
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $2::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $6 AND sa.company_id = e.company_id`,
      [employeeId, date,
       SHIFT_ASSIGNMENT_SCOPE_EMPLOYEE, SHIFT_ASSIGNMENT_SCOPE_DEPARTMENT,
       SHIFT_ASSIGNMENT_SCOPE_BRANCH, SHIFT_ASSIGNMENT_SCOPE_COMPANY],
    );
    return result.rows.map(rowToEntity);
  }

  async findEffectiveForRange(employeeId: number, fromDate: string, toDate: string): Promise<ShiftAssignment[]> {
    const result: QueryResult<ShiftAssignmentRow> = await this.pool.query(
      `SELECT sa.* FROM shift_assignments sa
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $3::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $4 AND sa.employee_id = $1
       UNION ALL
       SELECT sa.* FROM shift_assignments sa
       JOIN employees e ON e.id = $1
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $3::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $5 AND sa.department_id = e.department_id
       UNION ALL
       SELECT sa.* FROM shift_assignments sa
       JOIN employees e ON e.id = $1
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $3::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $6 AND sa.branch_id = e.branch_id
       UNION ALL
       SELECT sa.* FROM shift_assignments sa
       JOIN employees e ON e.id = $1
       WHERE sa.deleted_at IS NULL
         AND (sa.starts_on IS NULL OR sa.starts_on <= $3::date)
         AND (sa.ends_on IS NULL OR sa.ends_on >= $2::date)
         AND sa.scope_type = $7 AND sa.company_id = e.company_id`,
      [employeeId, fromDate, toDate,
       SHIFT_ASSIGNMENT_SCOPE_EMPLOYEE, SHIFT_ASSIGNMENT_SCOPE_DEPARTMENT,
       SHIFT_ASSIGNMENT_SCOPE_BRANCH, SHIFT_ASSIGNMENT_SCOPE_COMPANY],
    );
    return result.rows.map(rowToEntity);
  }
}
