import { Pool, QueryResult } from 'pg';
import { ICompanyRepository } from '../../../modules/attendance/domain/repositories';
import { Company, CreateCompanyInput, UpdateCompanyInput } from '../../../modules/attendance/domain/entities';

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
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.code !== undefined) {
      fields.push(`code = $${paramIndex++}`);
      values.push(input.code);
    }
    if (input.timezone !== undefined) {
      fields.push(`timezone = $${paramIndex++}`);
      values.push(input.timezone);
    }

    if (fields.length === 0) {
      return this.findById(id) as Promise<Company>;
    }

    values.push(id);
    const result: QueryResult<CompanyRow> = await this.pool.query(
      `UPDATE companies SET ${fields.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE companies SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
