export type PunchType = 'in' | 'out';

export interface AttendanceEvidence {
  id: number;
  employeeId: number;
  attendanceRecordId: number | null;
  punchType: PunchType;
  deviceId: number | null;
  clientTime: Date;
  serverTime: Date;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  wifiSsid: string | null;
  wifiBssid: string | null;
  photoPath: string | null;
  note: string | null;
  gpsValid: boolean;
  wifiValid: boolean;
  distanceM: number | null;
  matchedLocationId: number | null;
  matchedWifiId: number | null;
  validationError: string | null;
  createdAt: Date;
}

export interface CreateEvidenceInput {
  employeeId: number;
  attendanceRecordId?: number;
  punchType: PunchType;
  deviceId?: number;
  clientTime: Date;
  lat?: number;
  lng?: number;
  accuracyM?: number;
  wifiSsid?: string;
  wifiBssid?: string;
  photoPath?: string;
  note?: string;
}
