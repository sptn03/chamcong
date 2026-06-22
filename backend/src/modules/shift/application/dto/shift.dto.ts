import { Shift } from '../../domain/entities';
import { toVNTime } from '../../../../shared/utils/datetime';

export interface ShiftDto {
  id: number;
  companyId: number;
  name: string;
  startTime: string;
  endTime: string;
  checkinFrom: string;
  checkinTo: string;
  checkoutFrom: string;
  checkoutTo: string;
  weekdays: number;
  attendanceMethod: string;
  lateThresholdMin: number;
  earlyThresholdMin: number;
  workCredit: number;
  createdAt: string;
}

/** Format Postgres INTERVAL to "HH:MM" string */
function fmtInterval(v: any): string {
  if (!v) return '00:00';
  // PG driver trả về object {hours, minutes} cho interval
  if (typeof v === 'object' && v !== null) {
    const h = String(v.hours ?? 0).padStart(2, '0');
    const m = String(v.minutes ?? 0).padStart(2, '0');
    return `${h}:${m}`;
  }
  // Nếu là string "08:00:00" thì cắt bỏ giây
  if (typeof v === 'string') return v.slice(0, 5);
  return String(v);
}

export function shiftToDto(entity: Shift): ShiftDto {
  return {
    id: entity.id,
    companyId: entity.companyId,
    name: entity.name,
    startTime: fmtInterval(entity.startTime),
    endTime: fmtInterval(entity.endTime),
    checkinFrom: fmtInterval(entity.checkinFrom),
    checkinTo: fmtInterval(entity.checkinTo),
    checkoutFrom: fmtInterval(entity.checkoutFrom),
    checkoutTo: fmtInterval(entity.checkoutTo),
    weekdays: entity.weekdays,
    attendanceMethod: entity.attendanceMethod,
    lateThresholdMin: entity.lateThresholdMin,
    earlyThresholdMin: entity.earlyThresholdMin,
    workCredit: entity.workCredit,
    createdAt: toVNTime(entity.createdAt),
  };
}

export interface CreateShiftDto {
  companyId: number;
  name: string;
  startTime: string;
  endTime: string;
  checkinFrom: string;
  checkinTo: string;
  checkoutFrom: string;
  checkoutTo: string;
  weekdays: number;
  attendanceMethod: 'gps' | 'wifi' | 'gps_wifi';
  lateThresholdMin?: number;
  earlyThresholdMin?: number;
  workCredit?: number;
}

export interface UpdateShiftDto {
  name?: string;
  startTime?: string;
  endTime?: string;
  checkinFrom?: string;
  checkinTo?: string;
  checkoutFrom?: string;
  checkoutTo?: string;
  weekdays?: number;
  attendanceMethod?: 'gps' | 'wifi' | 'gps_wifi';
  lateThresholdMin?: number;
  earlyThresholdMin?: number;
  workCredit?: number;
}
