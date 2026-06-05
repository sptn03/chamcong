import { Pool, QueryResult } from 'pg';
import { IDepartmentRepository } from '../../../modules/attendance/domain/repositories';
import { Department, CreateDepartmentInput, UpdateDepartmentInput } from '../../../modules/attendance/domain/entities';

interface DepartmentRow {
  id: number;
  company_id: number;
  branch_id: number | null;
  name: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: DepartmentRow): Department {
  return {
    id: row.id,
    companyId: row.company_id,
    branchId: row.branch_id,
    name: row.name,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresDepartmentRepository implements IDepartmentRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Department | null> {
    const result: QueryResult<DepartmentRow> = await this.pool.query(
      'SELECT * FROM departments WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByCompanyId(companyId: number): Promise<Department[]> {
    const result: QueryResult<DepartmentRow> = await this.pool.query(
      'SELECT * FROM departments WHERE company_id = $1 AND deleted_at IS NULL ORDER BY name',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByBranchId(branchId: number): Promise<Department[]> {
    const result: QueryResult<DepartmentRow> = await this.pool.query(
      'SELECT * FROM departments WHERE branch_id = $1 AND deleted_at IS NULL ORDER BY name',
      [branchId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateDepartmentInput): Promise<Department> {
    const result: QueryResult<DepartmentRow> = await this.pool.query(
      `INSERT INTO departments (company_id, branch_id, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.companyId, input.branchId ?? null, input.name],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: UpdateDepartmentInput): Promise<Department> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(input.name); }
    if (input.branchId !== undefined) { fields.push(`branch_id = $${paramIndex++}`); values.push(input.branchId); }

    if (fields.length === 0) return this.findById(id) as Promise<Department>;

    values.push(id);
    const result: QueryResult<DepartmentRow> = await this.pool.query(
      `UPDATE departments SET ${fields.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE departments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
