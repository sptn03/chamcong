import { Pool, QueryResult } from 'pg';
import { IBranchRepository } from '../../../modules/attendance/domain/repositories';
import { Branch, CreateBranchInput, UpdateBranchInput } from '../../../modules/attendance/domain/entities';
import { buildUpdateSet } from '../../../shared/utils/db';

interface BranchRow {
  id: number;
  company_id: number;
  name: string;
  address: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: BranchRow): Branch {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    address: row.address,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresBranchRepository implements IBranchRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Branch | null> {
    const result: QueryResult<BranchRow> = await this.pool.query(
      'SELECT * FROM branches WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByCompanyId(companyId: number): Promise<Branch[]> {
    const result: QueryResult<BranchRow> = await this.pool.query(
      'SELECT * FROM branches WHERE company_id = $1 AND deleted_at IS NULL ORDER BY name',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateBranchInput): Promise<Branch> {
    const result: QueryResult<BranchRow> = await this.pool.query(
      `INSERT INTO branches (company_id, name, address)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.companyId, input.name, input.address ?? null],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: UpdateBranchInput): Promise<Branch> {
    const { setClauses, values } = buildUpdateSet([
      ['name', input.name],
      ['address', input.address],
    ]);

    if (setClauses.length === 0) return this.findById(id) as Promise<Branch>;

    const result: QueryResult<BranchRow> = await this.pool.query(
      `UPDATE branches SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} AND deleted_at IS NULL RETURNING *`,
      [...values, id],
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE branches SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
