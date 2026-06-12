import { AttendanceRecord, AttendanceEvidence } from '../../domain/entities';
import { toVNTime, toVNTimeNullable } from '../../../../shared/utils/datetime';

export interface AttendanceRecordDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  branchId: number;
  departmentId: number;
  shiftId: number;
  workDate: string;
  checkinAt: string | null;
  checkoutAt: string | null;
  source: string;
  approvalStatus: string;
  workStatus: string;
  lateMin: number;
  earlyMin: number;
  actualWorkMinutes: number;
  workCredit: number;
  createdAt: string;
  photoPath?: string | null;
  note?: string | null;
  lat?: number | null;
  lng?: number | null;
  checkinPhotoPath?: string | null;
  checkoutPhotoPath?: string | null;
  checkinLat?: number | null;
  checkinLng?: number | null;
  checkoutLat?: number | null;
  checkoutLng?: number | null;
  checkinNote?: string | null;
  checkoutNote?: string | null;
  adminNote?: string | null;
}

export function attendanceRecordToDto(record: AttendanceRecord): AttendanceRecordDto {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeName: '',
    employeeCode: '',
    branchId: record.branchId,
    departmentId: record.departmentId,
    shiftId: record.shiftId,
    workDate: record.workDate,
    checkinAt: toVNTimeNullable(record.checkinAt),
    checkoutAt: toVNTimeNullable(record.checkoutAt),
    source: record.source,
    approvalStatus: record.approvalStatus,
    workStatus: record.workStatus,
    lateMin: record.lateMin,
    earlyMin: record.earlyMin,
    actualWorkMinutes: record.actualWorkMinutes,
    workCredit: Number(record.workCredit),
    createdAt: toVNTime(record.createdAt),
  };
}

export interface AttendanceEvidenceDto {
  id: number;
  employeeId: number;
  attendanceRecordId: number | null;
  punchType: string;
  deviceId: number | null;
  clientTime: string;
  serverTime: string;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  wifiSsid: string | null;
  wifiBssid: string | null;
  photoPath: string | null;
  note: string | null;
  gpsValid: boolean;
  wifiValid: boolean;
  createdAt: string;
}

export function evidenceToDto(ev: AttendanceEvidence): AttendanceEvidenceDto {
  return {
    id: ev.id,
    employeeId: ev.employeeId,
    attendanceRecordId: ev.attendanceRecordId,
    punchType: ev.punchType,
    deviceId: ev.deviceId,
    clientTime: toVNTime(ev.clientTime),
    serverTime: toVNTime(ev.serverTime),
    lat: ev.lat,
    lng: ev.lng,
    accuracyM: ev.accuracyM,
    wifiSsid: ev.wifiSsid,
    wifiBssid: ev.wifiBssid,
    photoPath: ev.photoPath,
    note: ev.note,
    gpsValid: ev.gpsValid,
    wifiValid: ev.wifiValid,
    createdAt: toVNTime(ev.createdAt),
  };
}

export interface AttendanceFilterDto {
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

export interface CheckinDto {
  employeeId: number;
  shiftId: number;
  workDate: string;
  lat?: number;
  lng?: number;
  accuracyM?: number;
  wifiSsid?: string;
  wifiBssid?: string;
  photoPath?: string;
  note?: string;
  deviceId?: number;
  clientTime?: string;
}

export interface CheckoutDto {
  attendanceRecordId: number;
  lat?: number;
  lng?: number;
  accuracyM?: number;
  wifiSsid?: string;
  wifiBssid?: string;
  photoPath?: string;
  note?: string;
  deviceId?: number;
  clientTime?: string;
}
