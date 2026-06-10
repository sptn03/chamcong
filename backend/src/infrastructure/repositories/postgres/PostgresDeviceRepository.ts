import { Pool, QueryResult } from 'pg';
import { IDeviceRepository } from '../../../modules/attendance/domain/repositories';
import { Device, RegisterDeviceInput } from '../../../modules/attendance/domain/entities';
import {
  DEVICE_STATUS_APPROVED,
  DEVICE_STATUS_REVOKED,
} from '../../../shared/constants';

interface DeviceRow {
  id: number;
  user_id: number;
  device_uid: string;
  device_name: string | null;
  platform: number;
  os_version: string | null;
  app_version: string | null;
  push_token: string | null;
  status: number;
  last_login_at: Date | null;
  ip_address: string | null;
  user_agent: string | null;
  reviewed_by: number | null;
  reviewed_at: Date | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

const DEVICE_PLATFORM_MAP: Record<number, string> = { 1: 'ios', 2: 'android' };
const DEVICE_STATUS_MAP: Record<number, string> = { 1: 'pending', 2: 'approved', 3: 'rejected', 4: 'revoked' };

function rowToEntity(row: DeviceRow): Device {
  return {
    id: row.id,
    userId: row.user_id,
    deviceUid: row.device_uid,
    deviceName: row.device_name,
    platform: DEVICE_PLATFORM_MAP[row.platform] as Device['platform'],
    osVersion: row.os_version,
    appVersion: row.app_version,
    pushToken: row.push_token,
    status: DEVICE_STATUS_MAP[row.status] as Device['status'],
    lastLoginAt: row.last_login_at,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PLATFORM_DB: Record<string, number> = { ios: 1, android: 2 };

export class PostgresDeviceRepository implements IDeviceRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Device | null> {
    const result: QueryResult<DeviceRow> = await this.pool.query(
      'SELECT * FROM devices WHERE id = $1',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByUserId(userId: number): Promise<Device[]> {
    const result: QueryResult<DeviceRow> = await this.pool.query(
      'SELECT * FROM devices WHERE user_id = $1 ORDER BY last_login_at DESC',
      [userId],
    );
    return result.rows.map(rowToEntity);
  }

  async findAll(companyId?: number): Promise<Device[]> {
    let queryStr = `
      SELECT d.*, u.full_name AS user_name 
      FROM devices d 
      LEFT JOIN users u ON u.id = d.user_id 
    `;
    const params: any[] = [];
    if (companyId !== undefined) {
      queryStr += `
        WHERE d.user_id IN (
          SELECT user_id FROM employees WHERE company_id = $1 AND deleted_at IS NULL
        )
      `;
      params.push(companyId);
    }
    queryStr += ` ORDER BY d.last_login_at DESC NULLS LAST`;

    const result: QueryResult<DeviceRow & { user_name: string }> = await this.pool.query(
      queryStr,
      params,
    );
    return result.rows.map((row) => ({
      ...rowToEntity(row),
      userName: row.user_name,
    }));
  }

  async findByUid(userId: number, deviceUid: string): Promise<Device | null> {
    const result: QueryResult<DeviceRow> = await this.pool.query(
      'SELECT * FROM devices WHERE user_id = $1 AND device_uid = $2',
      [userId, deviceUid],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async create(input: RegisterDeviceInput): Promise<Device> {
    const result: QueryResult<DeviceRow> = await this.pool.query(
      `INSERT INTO devices (user_id, device_uid, device_name, platform, os_version, app_version, push_token, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, device_uid) DO UPDATE SET
         device_name = EXCLUDED.device_name,
         platform = EXCLUDED.platform,
         os_version = EXCLUDED.os_version,
         app_version = EXCLUDED.app_version,
         push_token = COALESCE(EXCLUDED.push_token, devices.push_token),
         ip_address = EXCLUDED.ip_address,
         user_agent = EXCLUDED.user_agent,
         updated_at = NOW()
       RETURNING *`,
      [input.userId, input.deviceUid, input.deviceName ?? null, PLATFORM_DB[input.platform],
       input.osVersion ?? null, input.appVersion ?? null, input.pushToken ?? null,
       input.ipAddress ?? null, input.userAgent ?? null],
    );
    return rowToEntity(result.rows[0]);
  }

  async updateStatus(id: number, status: Device['status'], reviewedBy?: number, rejectionReason?: string): Promise<void> {
    if (status === 'approved') {
      const deviceRes = await this.pool.query('SELECT user_id FROM devices WHERE id = $1', [id]);
      if (deviceRes.rows.length) {
        const userId = deviceRes.rows[0].user_id;
        // Revoke device cũ
        const revoked = await this.pool.query(
          `UPDATE devices SET status = $1, updated_at = NOW() WHERE user_id = $2 AND status = $3 AND id <> $4 RETURNING id`,
          [DEVICE_STATUS_REVOKED, userId, DEVICE_STATUS_APPROVED, id]
        );
        // Deactive token của device bị revoked
        if (revoked.rows.length > 0) {
          const revokedIds = revoked.rows.map(r => r.id);
          await this.pool.query(
            `UPDATE tokens SET active = FALSE, updated_at = NOW() WHERE device_id = ANY($1::bigint[]) AND active = TRUE`,
            [revokedIds]
          );
        }
      }
    }

    const statusDb = status === 'pending' ? 1
      : status === 'approved' ? 2
      : status === 'rejected' ? 3
      : 4;

    await this.pool.query(
      `UPDATE devices 
       SET status = $1, 
           reviewed_by = $2, 
           reviewed_at = CASE WHEN $1::smallint IN (2, 3) THEN NOW() ELSE NULL END,
           rejection_reason = $3,
           updated_at = NOW() 
       WHERE id = $4`,
      [statusDb, reviewedBy ?? null, rejectionReason ?? null, id]
    );
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.pool.query('UPDATE devices SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
  }
}
