import { Pool, QueryResult } from 'pg';
import { IMembershipRepository } from '../../../modules/attendance/domain/repositories';
import { CompanyMembership, CreateMembershipInput } from '../../../modules/attendance/domain/entities';

interface MembershipRow {
  id: number;
  user_id: number;
  company_id: number;
  employee_id: number | null;
  role: string;
  active_department_id: number | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: MembershipRow): CompanyMembership {
  return {
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    role: row.role as CompanyMembership['role'],
    activeDepartmentId: row.active_department_id,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresMembershipRepository implements IMembershipRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<CompanyMembership | null> {
    const result: QueryResult<MembershipRow> = await this.pool.query(
      'SELECT * FROM company_memberships WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByUserId(userId: number): Promise<CompanyMembership[]> {
    const result: QueryResult<MembershipRow> = await this.pool.query(
      'SELECT * FROM company_memberships WHERE user_id = $1 AND deleted_at IS NULL',
      [userId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByCompanyId(companyId: number): Promise<CompanyMembership[]> {
    const result: QueryResult<MembershipRow> = await this.pool.query(
      'SELECT * FROM company_memberships WHERE company_id = $1 AND deleted_at IS NULL',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async findActive(userId: number, companyId: number): Promise<CompanyMembership | null> {
    const result: QueryResult<MembershipRow> = await this.pool.query(
      'SELECT * FROM company_memberships WHERE user_id = $1 AND company_id = $2 AND deleted_at IS NULL',
      [userId, companyId],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async create(input: CreateMembershipInput): Promise<CompanyMembership> {
    const result: QueryResult<MembershipRow> = await this.pool.query(
      `INSERT INTO company_memberships (user_id, company_id, employee_id, role, active_department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.userId, input.companyId, input.employeeId ?? null, input.role, input.activeDepartmentId ?? null],
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE company_memberships SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
