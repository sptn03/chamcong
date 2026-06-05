import { Pool, QueryResult } from 'pg';
import { IDeviceRepository } from '../../../modules/attendance/domain/repositories';
import { Device, RegisterDeviceInput } from '../../../modules/attendance/domain/entities';

interface DeviceRow {
  id: number;
  user_id: number;
  device_uid: string;
  device_name: string | null;
  platform: string;
  os_version: string | null;
  app_version: string | null;
  push_token: string | null;
  status: string;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: DeviceRow): Device {
  return {
    id: row.id,
    userId: row.user_id,
    deviceUid: row.device_uid,
    deviceName: row.device_name,
    platform: row.platform as Device['platform'],
    osVersion: row.os_version,
    appVersion: row.app_version,
    pushToken: row.push_token,
    status: row.status as Device['status'],
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

  async findByUid(userId: number, deviceUid: string): Promise<Device | null> {
    const result: QueryResult<DeviceRow> = await this.pool.query(
      'SELECT * FROM devices WHERE user_id = $1 AND device_uid = $2',
      [userId, deviceUid],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async create(input: RegisterDeviceInput): Promise<Device> {
    const result: QueryResult<DeviceRow> = await this.pool.query(
      `INSERT INTO devices (user_id, device_uid, device_name, platform, os_version, app_version, push_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, device_uid) DO UPDATE SET
         device_name = EXCLUDED.device_name,
         platform = EXCLUDED.platform,
         os_version = EXCLUDED.os_version,
         app_version = EXCLUDED.app_version,
         push_token = COALESCE(EXCLUDED.push_token, devices.push_token),
         updated_at = NOW()
       RETURNING *`,
      [input.userId, input.deviceUid, input.deviceName ?? null, input.platform,
       input.osVersion ?? null, input.appVersion ?? null, input.pushToken ?? null],
    );
    return rowToEntity(result.rows[0]);
  }

  async updateStatus(id: number, status: Device['status']): Promise<void> {
    await this.pool.query('UPDATE devices SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.pool.query('UPDATE devices SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
  }
}
