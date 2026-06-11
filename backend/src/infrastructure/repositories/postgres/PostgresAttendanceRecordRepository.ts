import { Pool, QueryResult } from 'pg';
import { IAttendanceRecordRepository, AttendanceRecordFilter, PaginatedResult } from '../../../modules/attendance/domain/repositories';
import { AttendanceRecord, CreateAttendanceRecordInput, UpdateAttendanceRecordInput } from '../../../modules/attendance/domain/entities';
import {
  APPROVAL_STATUS_APPROVED,
  APPROVAL_STATUS_REJECTED,
  ATTENDANCE_SOURCE_ONLINE,
  ATTENDANCE_SOURCE_OFFLINE,
  ATTENDANCE_SOURCE_ADMIN_EDIT,
  APPROVAL_STATUS_PENDING,
  WORK_STATUS_NORMAL,
  WORK_STATUS_LATE,
  WORK_STATUS_EARLY,
  WORK_STATUS_LATE_EARLY,
  WORK_STATUS_FORGOT,
  WORK_STATUS_ABSENT,
  WORK_STATUS_LEAVE,
} from '../../../shared/constants';

interface AttendanceRecordRow {
  id: number;
  company_id: number;
  employee_id: number;
  branch_id: number;
  department_id: number;
  shift_id: number;
  work_date: string;
  checkin_at: Date | null;
  checkout_at: Date | null;
  source: number;
  original_source: number;
  approval_status: number;
  work_status: number;
  late_min: number;
  early_min: number;
  actual_work_minutes: number;
  work_credit: number;
  approved_by: number | null;
  approved_at: Date | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

const ATTENDANCE_SOURCE_MAP: Record<number, string> = { 1: 'online', 2: 'offline', 3: 'admin_edit' };
const APPROVAL_STATUS_MAP: Record<number, string> = { 1: 'pending', 2: 'approved', 3: 'rejected' };
const WORK_STATUS_MAP: Record<number, string> = { 1: 'normal', 2: 'late', 3: 'early', 4: 'late_early', 5: 'forgot', 6: 'absent', 7: 'leave' };

const ATTENDANCE_SOURCE_DB: Record<string, number> = { online: 1, offline: 2, admin_edit: 3 };

function rowToEntity(row: AttendanceRecordRow): AttendanceRecord {
  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    branchId: row.branch_id,
    departmentId: row.department_id,
    shiftId: row.shift_id,
    workDate: row.work_date,
    checkinAt: row.checkin_at,
    checkoutAt: row.checkout_at,
    source: ATTENDANCE_SOURCE_MAP[row.source] as AttendanceRecord['source'],
    originalSource: ATTENDANCE_SOURCE_MAP[row.original_source] as AttendanceRecord['source'],
    approvalStatus: APPROVAL_STATUS_MAP[row.approval_status] as AttendanceRecord['approvalStatus'],
    workStatus: WORK_STATUS_MAP[row.work_status] as AttendanceRecord['workStatus'],
    lateMin: row.late_min,
    earlyMin: row.early_min,
    actualWorkMinutes: row.actual_work_minutes,
    workCredit: row.work_credit,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresAttendanceRecordRepository implements IAttendanceRecordRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<AttendanceRecord | null> {
    const result: QueryResult<AttendanceRecordRow> = await this.pool.query(
      'SELECT * FROM attendance_records WHERE id = $1',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByEmployeeAndDate(employeeId: number, workDate: string): Promise<AttendanceRecord[]> {
    const result: QueryResult<AttendanceRecordRow> = await this.pool.query(
      'SELECT * FROM attendance_records WHERE employee_id = $1 AND work_date = $2',
      [employeeId, workDate],
    );
    return result.rows.map(rowToEntity);
  }

  async findFiltered(filter: AttendanceRecordFilter): Promise<PaginatedResult<AttendanceRecord>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filter.companyId) {
      conditions.push(`company_id = $${paramIndex++}`);
      values.push(filter.companyId);
    }
    if (filter.employeeId) {
      conditions.push(`employee_id = $${paramIndex++}`);
      values.push(filter.employeeId);
    }
    if (filter.branchId) {
      conditions.push(`branch_id = $${paramIndex++}`);
      values.push(filter.branchId);
    }
    if (filter.departmentId) {
      conditions.push(`department_id = $${paramIndex++}`);
      values.push(filter.departmentId);
    }
    if (filter.fromDate) {
      conditions.push(`work_date >= $${paramIndex++}`);
      values.push(filter.fromDate);
    }
    if (filter.toDate) {
      conditions.push(`work_date <= $${paramIndex++}`);
      values.push(filter.toDate);
    }
    if (filter.approvalStatus) {
      const dbVal = APPROVAL_STATUS_DB[filter.approvalStatus] ?? APPROVAL_STATUS_PENDING;
      conditions.push(`approval_status = $${paramIndex++}`);
      values.push(dbVal);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const offset = (page - 1) * limit;

    const countResult: QueryResult<{ total: number }> = await this.pool.query(
      `SELECT COUNT(*) as total FROM attendance_records ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total.toString(), 10);

    const dataResult: QueryResult<AttendanceRecordRow> = await this.pool.query(
      `SELECT * FROM attendance_records ${whereClause} ORDER BY work_date DESC, id DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset],
    );

    return {
      data: dataResult.rows.map(rowToEntity),
      total,
      page,
      limit,
    };
  }

  async create(input: CreateAttendanceRecordInput): Promise<AttendanceRecord> {
    const source = input.source ? (ATTENDANCE_SOURCE_DB[input.source] ?? ATTENDANCE_SOURCE_ONLINE) : ATTENDANCE_SOURCE_ONLINE;
    const result: QueryResult<AttendanceRecordRow> = await this.pool.query(
      `INSERT INTO attendance_records
       (company_id, employee_id, branch_id, department_id, shift_id, work_date, checkin_at, source, original_source, actual_work_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [input.companyId, input.employeeId, input.branchId, input.departmentId,
       input.shiftId, input.workDate, input.checkinAt ?? null,
       source, source, input.actualWorkMinutes ?? 0],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: UpdateAttendanceRecordInput): Promise<AttendanceRecord> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.checkinAt !== undefined) { fields.push(`checkin_at = $${paramIndex++}`); values.push(input.checkinAt); }
    if (input.checkoutAt !== undefined) { fields.push(`checkout_at = $${paramIndex++}`); values.push(input.checkoutAt); }
    if (input.approvalStatus !== undefined) {
      fields.push(`approval_status = $${paramIndex++}`);
      values.push(APPROVAL_STATUS_DB[input.approvalStatus]);
    }
    if (input.workStatus !== undefined) {
      fields.push(`work_status = $${paramIndex++}`);
      values.push(WORK_STATUS_DB[input.workStatus]);
    }
    if (input.lateMin !== undefined) { fields.push(`late_min = $${paramIndex++}`); values.push(input.lateMin); }
    if (input.earlyMin !== undefined) { fields.push(`early_min = $${paramIndex++}`); values.push(input.earlyMin); }
    if (input.actualWorkMinutes !== undefined) { fields.push(`actual_work_minutes = $${paramIndex++}`); values.push(input.actualWorkMinutes); }
    if (input.workCredit !== undefined) { fields.push(`work_credit = $${paramIndex++}`); values.push(input.workCredit); }

    if (fields.length === 0) {
      return this.findById(id) as Promise<AttendanceRecord>;
    }

    values.push(id);
    const result: QueryResult<AttendanceRecordRow> = await this.pool.query(
      `UPDATE attendance_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );
    return rowToEntity(result.rows[0]);
  }

  async approve(id: number, approvedBy: number, rejectionReason?: string): Promise<void> {
    const status = rejectionReason ? APPROVAL_STATUS_REJECTED : APPROVAL_STATUS_APPROVED;
    await this.pool.query(
      `UPDATE attendance_records
       SET approval_status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = $3
       WHERE id = $4`,
      [status, approvedBy, rejectionReason ?? null, id],
    );
  }

  async logEdit(recordId: number, editedBy: number, beforeJson: string, afterJson: string, reason: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO attendance_edit_logs (attendance_record_id, edited_by, before_json, after_json, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [recordId, editedBy, beforeJson, afterJson, reason],
    );
  }

  async findLatestEditLogs(recordIds: number[]): Promise<Record<number, { reason: string; editedBy: number }>> {
    if (recordIds.length === 0) return {};
    const result = await this.pool.query(
      `SELECT DISTINCT ON (attendance_record_id) attendance_record_id, reason, edited_by
       FROM attendance_edit_logs
       WHERE attendance_record_id = ANY($1)
       ORDER BY attendance_record_id, id DESC`,
      [recordIds],
    );
    const map: Record<number, { reason: string; editedBy: number }> = {};
    for (const row of result.rows) {
      map[parseInt(row.attendance_record_id.toString(), 10)] = {
        reason: row.reason,
        editedBy: parseInt(row.edited_by.toString(), 10),
      };
    }
    return map;
  }
}

const APPROVAL_STATUS_DB: Record<string, number> = { pending: 1, approved: 2, rejected: 3 };
const WORK_STATUS_DB: Record<string, number> = { normal: 1, late: 2, early: 3, late_early: 4, forgot: 5, absent: 6, leave: 7 };
