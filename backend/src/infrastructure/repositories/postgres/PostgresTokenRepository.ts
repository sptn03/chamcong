import { Pool, QueryResult } from 'pg';
import { ITokenRepository } from '../../../modules/attendance/domain/repositories';
import { Token, CreateTokenInput } from '../../../modules/attendance/domain/entities';

interface TokenRow {
  id: number;
  user_id: number;
  device_id: number | null;
  token: string;
  active: boolean;
  ip_address: string | null;
  user_agent: string | null;
  active_company_id: number | null;
  active_employee_id: number | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: TokenRow): Token {
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    token: row.token,
    active: row.active,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    activeCompanyId: row.active_company_id,
    activeEmployeeId: row.active_employee_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresTokenRepository implements ITokenRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Token | null> {
    const result: QueryResult<TokenRow> = await this.pool.query(
      'SELECT * FROM tokens WHERE id = $1',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByToken(token: string, includeInactive = false): Promise<Token | null> {
    const query = includeInactive
      ? 'SELECT * FROM tokens WHERE token = $1'
      : 'SELECT * FROM tokens WHERE token = $1 AND active = TRUE';
    const result: QueryResult<TokenRow> = await this.pool.query(query, [token]);
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByUserId(userId: number): Promise<Token[]> {
    const result: QueryResult<TokenRow> = await this.pool.query(
      'SELECT * FROM tokens WHERE user_id = $1 AND active = TRUE ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateTokenInput): Promise<Token> {
    const result: QueryResult<TokenRow> = await this.pool.query(
      `INSERT INTO tokens (user_id, device_id, token, ip_address, user_agent, active_company_id, active_employee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.userId,
        input.deviceId ?? null,
        input.token,
        input.ipAddress ?? null,
        input.userAgent ?? null,
        input.activeCompanyId ?? null,
        input.activeEmployeeId ?? null,
      ],
    );
    return rowToEntity(result.rows[0]);
  }

  async deactivate(id: number): Promise<void> {
    await this.pool.query('UPDATE tokens SET active = FALSE, updated_at = NOW() WHERE id = $1', [id]);
  }

  async deactivateAllForUser(userId: number): Promise<void> {
    await this.pool.query(
      'UPDATE tokens SET active = FALSE, updated_at = NOW() WHERE user_id = $1 AND active = TRUE',
      [userId],
    );
  }

  async updateActiveContext(id: number, companyId: number | null, employeeId: number | null): Promise<void> {
    await this.pool.query(
      'UPDATE tokens SET active_company_id = $1, active_employee_id = $2, updated_at = NOW() WHERE id = $3',
      [companyId, employeeId, id],
    );
  }

  async reactivate(id: number, userId: number, deviceId: number | null): Promise<Token> {
    const result: QueryResult<TokenRow> = await this.pool.query(
      'UPDATE tokens SET active = TRUE, user_id = $1, device_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [userId, deviceId, id]
    );
    return rowToEntity(result.rows[0]);
  }
}
