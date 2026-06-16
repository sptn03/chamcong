import {
  AttendanceRecord,
  CreateAttendanceRecordInput,
  UpdateAttendanceRecordInput,
} from '../entities';

export interface AttendanceRecordFilter {
  companyId?: number;
  employeeId?: number;
  branchId?: number;
  departmentId?: number;
  fromDate?: string;
  toDate?: string;
  approvalStatus?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IAttendanceRecordRepository {
  findById(id: number): Promise<AttendanceRecord | null>;
  findByEmployeeAndDate(employeeId: number, workDate: string): Promise<AttendanceRecord[]>;
  findByEmployeeAndDateRange(employeeId: number, fromDate: string, toDate: string): Promise<AttendanceRecord[]>;
  findFiltered(filter: AttendanceRecordFilter): Promise<PaginatedResult<AttendanceRecord>>;
  create(input: CreateAttendanceRecordInput): Promise<AttendanceRecord>;
  update(id: number, input: UpdateAttendanceRecordInput): Promise<AttendanceRecord>;
  approve(id: number, approvedBy: number, rejectionReason?: string): Promise<void>;
  logEdit(recordId: number, editedBy: number, beforeJson: string, afterJson: string, reason: string): Promise<void>;
  findLatestEditLogs(recordIds: number[]): Promise<Record<number, { reason: string; editedBy: number }>>;
}
