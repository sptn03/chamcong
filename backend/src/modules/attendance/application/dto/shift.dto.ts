import { Shift } from '../../domain/entities';

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

export function shiftToDto(entity: Shift): ShiftDto {
  return {
    id: entity.id,
    companyId: entity.companyId,
    name: entity.name,
    startTime: entity.startTime,
    endTime: entity.endTime,
    checkinFrom: entity.checkinFrom,
    checkinTo: entity.checkinTo,
    checkoutFrom: entity.checkoutFrom,
    checkoutTo: entity.checkoutTo,
    weekdays: entity.weekdays,
    attendanceMethod: entity.attendanceMethod,
    lateThresholdMin: entity.lateThresholdMin,
    earlyThresholdMin: entity.earlyThresholdMin,
    workCredit: entity.workCredit,
    createdAt: entity.createdAt.toISOString(),
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
