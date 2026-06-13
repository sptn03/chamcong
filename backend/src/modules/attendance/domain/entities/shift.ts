export type AttendanceMethod = 'gps' | 'wifi' | 'gps_wifi' | 'gps_or_wifi';

export interface Shift {
  id: number;
  companyId: number;
  name: string;
  startTime: string; // ISO interval string, e.g. '08:00:00'
  endTime: string;   // ISO interval string, e.g. '17:00:00'
  checkinFrom: string;
  checkinTo: string;
  checkoutFrom: string;
  checkoutTo: string;
  weekdays: number; // Bitmask: Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64
  attendanceMethod: AttendanceMethod;
  lateThresholdMin: number;
  earlyThresholdMin: number;
  workCredit: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShiftInput {
  companyId: number;
  name: string;
  startTime: string;
  endTime: string;
  checkinFrom: string;
  checkinTo: string;
  checkoutFrom: string;
  checkoutTo: string;
  weekdays: number;
  attendanceMethod: AttendanceMethod;
  lateThresholdMin?: number;
  earlyThresholdMin?: number;
  workCredit?: number;
}
