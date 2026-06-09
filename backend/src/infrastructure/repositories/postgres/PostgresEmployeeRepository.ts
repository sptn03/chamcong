import { Pool, QueryResult } from 'pg';
import { IEmployeeRepository } from '../../../modules/attendance/domain/repositories';
import { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../../../modules/attendance/domain/entities';
import { EMPLOYEE_STATUS_ACTIVE } from '../../../shared/constants';

interface EmployeeRow {
  id: number;
  user_id: number;
  company_id: number;
  branch_id: number;
  department_id: number;
  employee_code: string;
  title: string | null;
  status: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  full_name?: string;
  user_phone?: string;
  membership_role?: number;
}

const EMPLOYEE_STATUS_MAP: Record<number, string> = { 1: 'active', 2: 'locked' };

function rowToEntity(row: EmployeeRow): Employee {
  return {
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    branchId: row.branch_id,
    departmentId: row.department_id,
    employeeCode: row.employee_code,
    title: row.title,
    status: EMPLOYEE_STATUS_MAP[row.status] as Employee['status'],
    fullName: row.full_name,
    phone: row.user_phone,
    role: row.membership_role,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function statusToDb(status: string | undefined): number | undefined {
  if (status === undefined) return undefined;
  return status === 'active' ? EMPLOYEE_STATUS_ACTIVE : 2;
}

export class PostgresEmployeeRepository implements IEmployeeRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Employee | null> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      `SELECT e.*, u.full_name, u.phone AS user_phone, m.role AS membership_role 
       FROM employees e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN company_memberships m ON m.employee_id = e.id AND m.deleted_at IS NULL
       WHERE e.id = $1 AND e.deleted_at IS NULL`,
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByUserId(userId: number): Promise<Employee[]> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      `SELECT e.*, u.full_name, u.phone AS user_phone, m.role AS membership_role 
       FROM employees e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN company_memberships m ON m.employee_id = e.id AND m.deleted_at IS NULL
       WHERE e.user_id = $1 AND e.deleted_at IS NULL`,
      [userId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByCompanyId(companyId: number): Promise<Employee[]> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      `SELECT e.*, u.full_name, u.phone AS user_phone, m.role AS membership_role 
       FROM employees e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN company_memberships m ON m.employee_id = e.id AND m.deleted_at IS NULL
       WHERE e.company_id = $1 AND e.deleted_at IS NULL
       ORDER BY u.full_name`,
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByCode(companyId: number, employeeCode: string): Promise<Employee | null> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      `SELECT e.*, u.full_name, u.phone AS user_phone, m.role AS membership_role 
       FROM employees e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN company_memberships m ON m.employee_id = e.id AND m.deleted_at IS NULL
       WHERE e.company_id = $1 AND e.employee_code = $2 AND e.deleted_at IS NULL`,
      [companyId, employeeCode],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const result = await this.pool.query(
      `INSERT INTO employees (user_id, company_id, branch_id, department_id, employee_code, title)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [input.userId, input.companyId, input.branchId, input.departmentId,
       input.employeeCode, input.title ?? null],
    );
    return (await this.findById(result.rows[0].id))!;
  }

  async update(id: number, input: UpdateEmployeeInput): Promise<Employee> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.branchId !== undefined) { fields.push(`branch_id = $${paramIndex++}`); values.push(input.branchId); }
    if (input.departmentId !== undefined) { fields.push(`department_id = $${paramIndex++}`); values.push(input.departmentId); }
    if (input.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(input.title); }
    if (input.status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(statusToDb(input.status)); }

    if (fields.length === 0) {
      return (await this.findById(id))!;
    }

    values.push(id);
    await this.pool.query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL`,
      values,
    );
    return (await this.findById(id))!;
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE employees SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
