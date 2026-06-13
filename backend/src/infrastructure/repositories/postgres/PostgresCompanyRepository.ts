import { Pool, QueryResult } from 'pg';
import { ICompanyRepository } from '../../../modules/attendance/domain/repositories';
import { Company, CreateCompanyInput, UpdateCompanyInput } from '../../../modules/attendance/domain/entities';
import { buildUpdateSet } from '../../../shared/utils/db';

interface CompanyRow {
  id: number;
  name: string;
  code: string;
  timezone: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    timezone: row.timezone,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresCompanyRepository implements ICompanyRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Company | null> {
    const result: QueryResult<CompanyRow> = await this.pool.query(
      'SELECT * FROM companies WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByCode(code: string): Promise<Company | null> {
    const result: QueryResult<CompanyRow> = await this.pool.query(
      'SELECT * FROM companies WHERE code = $1 AND deleted_at IS NULL',
      [code],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findAll(): Promise<Company[]> {
    const result: QueryResult<CompanyRow> = await this.pool.query(
      'SELECT * FROM companies WHERE deleted_at IS NULL ORDER BY name',
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateCompanyInput): Promise<Company> {
    const result: QueryResult<CompanyRow> = await this.pool.query(
      `INSERT INTO companies (name, code, timezone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.name, input.code, input.timezone ?? 'Asia/Ho_Chi_Minh'],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: UpdateCompanyInput): Promise<Company> {
    const { setClauses, values } = buildUpdateSet([
      ['name', input.name],
      ['code', input.code],
      ['timezone', input.timezone],
    ]);

    if (setClauses.length === 0) {
      return this.findById(id) as Promise<Company>;
    }

    const result: QueryResult<CompanyRow> = await this.pool.query(
      `UPDATE companies SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} AND deleted_at IS NULL RETURNING *`,
      [...values, id],
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE companies SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }

  async createWithDefaults(input: CreateCompanyInput, creatorUserId: number): Promise<Company> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Tạo công ty
      const companyRes = await client.query(
        `INSERT INTO companies (name, code, timezone)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [input.name, input.code, input.timezone ?? 'Asia/Ho_Chi_Minh']
      );
      const companyRow = companyRes.rows[0];

      // 2. Tạo default branch
      const branchRes = await client.query(
        `INSERT INTO branches (company_id, name, address)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [companyRow.id, 'Trụ sở chính', 'Mặc định']
      );
      const branchId = branchRes.rows[0].id;

      // 3. Tạo default department
      const deptRes = await client.query(
        `INSERT INTO departments (company_id, branch_id, name)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [companyRow.id, branchId, 'Văn phòng']
      );
      const deptId = deptRes.rows[0].id;

      // 4. Tạo hồ sơ nhân viên (status = 1 (active))
      const employeeRes = await client.query(
        `INSERT INTO employees (user_id, company_id, branch_id, department_id, employee_code, title, status)
         VALUES ($1, $2, $3, $4, $5, $6, 1)
         RETURNING id`,
        [creatorUserId, companyRow.id, branchId, deptId, 'ADMIN', 'Quản trị viên']
      );
      const employeeId = employeeRes.rows[0].id;

      // 5. Tạo company membership (role = 1 (admin))
      await client.query(
        `INSERT INTO company_memberships (user_id, company_id, employee_id, role, active_department_id)
         VALUES ($1, $2, $3, 1, $4)`,
        [creatorUserId, companyRow.id, employeeId, deptId]
      );

      await client.query('COMMIT');

      return rowToEntity(companyRow);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}