import { Pool, QueryResult } from 'pg';
import { IWifiRepository } from '../../../modules/attendance/domain/repositories';
import { Wifi, CreateWifiInput } from '../../../modules/attendance/domain/entities';
import { WIFI_MATCH_MODE_SSID, WIFI_MATCH_MODE_SSID_BSSID } from '../../../shared/constants';

interface WifiRow {
  id: number;
  company_id: number;
  branch_id: number;
  name: string | null;
  ssid: string;
  bssid: string | null;
  match_mode: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const WIFI_MATCH_MODE_MAP: Record<number, string> = { 1: 'ssid', 2: 'ssid_bssid' };

function rowToEntity(row: WifiRow): Wifi {
  return {
    id: row.id,
    companyId: row.company_id,
    branchId: row.branch_id,
    name: row.name,
    ssid: row.ssid,
    bssid: row.bssid,
    matchMode: WIFI_MATCH_MODE_MAP[row.match_mode] as Wifi['matchMode'],
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function matchModeToDb(mode: string | undefined): number {
  if (mode === 'ssid') return WIFI_MATCH_MODE_SSID;
  return WIFI_MATCH_MODE_SSID_BSSID;
}

export class PostgresWifiRepository implements IWifiRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Wifi | null> {
    const result: QueryResult<WifiRow> = await this.pool.query(
      'SELECT * FROM wifis WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByBranchId(branchId: number): Promise<Wifi[]> {
    const result: QueryResult<WifiRow> = await this.pool.query(
      'SELECT * FROM wifis WHERE branch_id = $1 AND deleted_at IS NULL ORDER BY name',
      [branchId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByCompanyId(companyId: number): Promise<Wifi[]> {
    const result: QueryResult<WifiRow> = await this.pool.query(
      'SELECT * FROM wifis WHERE company_id = $1 AND deleted_at IS NULL ORDER BY name',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async findBySsid(ssid: string, bssid?: string): Promise<Wifi | null> {
    let sql = 'SELECT * FROM wifis WHERE ssid = $1 AND deleted_at IS NULL';
    const params: unknown[] = [ssid];
    if (bssid) {
      sql += ' AND (match_mode = $2 OR bssid = $2)';
      params.push(bssid);
    }
    sql += ' LIMIT 1';
    const result: QueryResult<WifiRow> = await this.pool.query(sql, params);
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async create(input: CreateWifiInput): Promise<Wifi> {
    const result: QueryResult<WifiRow> = await this.pool.query(
      `INSERT INTO wifis (company_id, branch_id, name, ssid, bssid, match_mode)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.companyId, input.branchId, input.name ?? null,
       input.ssid, input.bssid ?? null, matchModeToDb(input.matchMode)],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: Partial<CreateWifiInput>): Promise<Wifi> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(input.name); }
    if (input.ssid !== undefined) { fields.push(`ssid = $${paramIndex++}`); values.push(input.ssid); }
    if (input.bssid !== undefined) { fields.push(`bssid = $${paramIndex++}`); values.push(input.bssid); }
    if (input.matchMode !== undefined) { fields.push(`match_mode = $${paramIndex++}`); values.push(matchModeToDb(input.matchMode)); }
    if (input.branchId !== undefined) { fields.push(`branch_id = $${paramIndex++}`); values.push(input.branchId); }

    if (fields.length === 0) return this.findById(id) as Promise<Wifi>;

    values.push(id);
    const result: QueryResult<WifiRow> = await this.pool.query(
      `UPDATE wifis SET ${fields.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE wifis SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
