export type AttendanceSource = 'online' | 'offline' | 'admin_edit';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type WorkStatus = 'normal' | 'late' | 'early' | 'late_early' | 'forgot' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: number;
  companyId: number;
  employeeId: number;
  branchId: number;
  departmentId: number;
  shiftId: number;
  workDate: string; // YYYY-MM-DD
  checkinAt: Date | null;
  checkoutAt: Date | null;
  source: AttendanceSource;
  originalSource: AttendanceSource;
  approvalStatus: ApprovalStatus;
  workStatus: WorkStatus;
  lateMin: number;
  earlyMin: number;
  actualWorkMinutes: number;
  workCredit: number;
  approvedBy: number | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttendanceRecordInput {
  companyId: number;
  employeeId: number;
  branchId: number;
  departmentId: number;
  shiftId: number;
  workDate: string;
  checkinAt?: Date;
  checkoutAt?: Date;
  source?: AttendanceSource;
  actualWorkMinutes?: number;
}

export interface UpdateAttendanceRecordInput {
  checkinAt?: Date;
  checkoutAt?: Date;
  approvalStatus?: ApprovalStatus;
  workStatus?: WorkStatus;
  lateMin?: number;
  earlyMin?: number;
  actualWorkMinutes?: number;
  workCredit?: number;
}
