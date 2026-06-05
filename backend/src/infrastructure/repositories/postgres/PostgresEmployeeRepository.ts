import { Pool, QueryResult } from 'pg';
import { IEmployeeRepository } from '../../../modules/attendance/domain/repositories';
import { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../../../modules/attendance/domain/entities';

interface EmployeeRow {
  id: number;
  user_id: number;
  company_id: number;
  branch_id: number;
  department_id: number;
  employee_code: string;
  full_name: string;
  birthday: string | null;
  gender: string | null;
  title: string | null;
  status: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: EmployeeRow): Employee {
  return {
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    branchId: row.branch_id,
    departmentId: row.department_id,
    employeeCode: row.employee_code,
    fullName: row.full_name,
    birthday: row.birthday,
    gender: row.gender as Employee['gender'],
    title: row.title,
    status: row.status as Employee['status'],
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresEmployeeRepository implements IEmployeeRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Employee | null> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      'SELECT * FROM employees WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByUserId(userId: number): Promise<Employee[]> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      'SELECT * FROM employees WHERE user_id = $1 AND deleted_at IS NULL',
      [userId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByCompanyId(companyId: number): Promise<Employee[]> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      'SELECT * FROM employees WHERE company_id = $1 AND deleted_at IS NULL ORDER BY full_name',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByCode(companyId: number, employeeCode: string): Promise<Employee | null> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      'SELECT * FROM employees WHERE company_id = $1 AND employee_code = $2 AND deleted_at IS NULL',
      [companyId, employeeCode],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      `INSERT INTO employees (user_id, company_id, branch_id, department_id, employee_code, full_name, birthday, gender, title)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [input.userId, input.companyId, input.branchId, input.departmentId,
       input.employeeCode, input.fullName, input.birthday ?? null,
       input.gender ?? null, input.title ?? null],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: UpdateEmployeeInput): Promise<Employee> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.branchId !== undefined) { fields.push(`branch_id = $${paramIndex++}`); values.push(input.branchId); }
    if (input.departmentId !== undefined) { fields.push(`department_id = $${paramIndex++}`); values.push(input.departmentId); }
    if (input.fullName !== undefined) { fields.push(`full_name = $${paramIndex++}`); values.push(input.fullName); }
    if (input.birthday !== undefined) { fields.push(`birthday = $${paramIndex++}`); values.push(input.birthday); }
    if (input.gender !== undefined) { fields.push(`gender = $${paramIndex++}`); values.push(input.gender); }
    if (input.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(input.title); }
    if (input.status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(input.status); }

    if (fields.length === 0) {
      return this.findById(id) as Promise<Employee>;
    }

    values.push(id);
    const result: QueryResult<EmployeeRow> = await this.pool.query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE employees SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
