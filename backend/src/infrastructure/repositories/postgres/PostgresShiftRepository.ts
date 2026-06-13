import { Pool, QueryResult } from 'pg';
import { IShiftRepository } from '../../../modules/attendance/domain/repositories';
import { Shift, CreateShiftInput } from '../../../modules/attendance/domain/entities';
import { buildUpdateSet } from '../../../shared/utils/db';

interface ShiftRow {
  id: number;
  company_id: number;
  name: string;
  start_time: string;
  end_time: string;
  checkin_from: string;
  checkin_to: string;
  checkout_from: string;
  checkout_to: string;
  weekdays: number;
  attendance_method: number;
  late_threshold_min: number;
  early_threshold_min: number;
  work_credit: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const ATTENDANCE_METHOD_MAP: Record<number, string> = { 1: 'gps', 2: 'wifi', 3: 'gps_wifi', 4: 'gps_or_wifi' };
const ATTENDANCE_METHOD_DB: Record<string, number> = { gps: 1, wifi: 2, gps_wifi: 3, gps_or_wifi: 4 };

function rowToEntity(row: ShiftRow): Shift {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    startTime: row.start_time,
    endTime: row.end_time,
    checkinFrom: row.checkin_from,
    checkinTo: row.checkin_to,
    checkoutFrom: row.checkout_from,
    checkoutTo: row.checkout_to,
    weekdays: row.weekdays,
    attendanceMethod: ATTENDANCE_METHOD_MAP[row.attendance_method] as Shift['attendanceMethod'],
    lateThresholdMin: row.late_threshold_min,
    earlyThresholdMin: row.early_threshold_min,
    workCredit: row.work_credit,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresShiftRepository implements IShiftRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Shift | null> {
    const result: QueryResult<ShiftRow> = await this.pool.query(
      'SELECT * FROM shifts WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByCompanyId(companyId: number): Promise<Shift[]> {
    const result: QueryResult<ShiftRow> = await this.pool.query(
      'SELECT * FROM shifts WHERE company_id = $1 AND deleted_at IS NULL ORDER BY name',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateShiftInput): Promise<Shift> {
    const result: QueryResult<ShiftRow> = await this.pool.query(
      `INSERT INTO shifts (company_id, name, start_time, end_time, checkin_from, checkin_to,
        checkout_from, checkout_to, weekdays, attendance_method, late_threshold_min,
        early_threshold_min, work_credit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [input.companyId, input.name, input.startTime, input.endTime,
       input.checkinFrom, input.checkinTo, input.checkoutFrom, input.checkoutTo,
       input.weekdays, ATTENDANCE_METHOD_DB[input.attendanceMethod],
       input.lateThresholdMin ?? 0, input.earlyThresholdMin ?? 0,
       input.workCredit ?? 1.0],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: Partial<CreateShiftInput>): Promise<Shift> {
    const { setClauses, values } = buildUpdateSet([
      ['name', input.name],
      ['start_time', input.startTime],
      ['end_time', input.endTime],
      ['checkin_from', input.checkinFrom],
      ['checkin_to', input.checkinTo],
      ['checkout_from', input.checkoutFrom],
      ['checkout_to', input.checkoutTo],
      ['attendance_method', input.attendanceMethod !== undefined ? ATTENDANCE_METHOD_DB[input.attendanceMethod] : undefined],
      ['weekdays', input.weekdays],
      ['late_threshold_min', input.lateThresholdMin],
      ['early_threshold_min', input.earlyThresholdMin],
      ['work_credit', input.workCredit],
    ]);

    if (setClauses.length === 0) return this.findById(id) as Promise<Shift>;

    const result: QueryResult<ShiftRow> = await this.pool.query(
      `UPDATE shifts SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} AND deleted_at IS NULL RETURNING *`,
      [...values, id],
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE shifts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }
}
