import { Pool, QueryResult } from 'pg';
import { IAttendanceEvidenceRepository } from '../../../modules/attendance/domain/repositories';
import { AttendanceEvidence, CreateEvidenceInput } from '../../../modules/attendance/domain/entities';

interface EvidenceRow {
  id: number;
  employee_id: number;
  attendance_record_id: number | null;
  punch_type: number;
  device_id: number | null;
  client_time: Date;
  server_time: Date;
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  wifi_ssid: string | null;
  wifi_bssid: string | null;
  photo: string | null;
  note: string | null;
  gps_valid: boolean;
  wifi_valid: boolean;
  distance_m: number | null;
  matched_location_id: number | null;
  matched_wifi_id: number | null;
  validation_error: string | null;
  created_at: Date;
}

const PUNCH_TYPE_MAP: Record<number, string> = { 1: 'in', 2: 'out' };
const PUNCH_TYPE_DB: Record<string, number> = { in: 1, out: 2 };

function rowToEntity(row: EvidenceRow): AttendanceEvidence {
  return {
    id: row.id,
    employeeId: row.employee_id,
    attendanceRecordId: row.attendance_record_id,
    punchType: PUNCH_TYPE_MAP[row.punch_type] as AttendanceEvidence['punchType'],
    deviceId: row.device_id,
    clientTime: row.client_time,
    serverTime: row.server_time,
    lat: row.lat,
    lng: row.lng,
    accuracyM: row.accuracy_m,
    wifiSsid: row.wifi_ssid,
    wifiBssid: row.wifi_bssid,
    photoPath: row.photo,
    note: row.note,
    gpsValid: row.gps_valid,
    wifiValid: row.wifi_valid,
    distanceM: row.distance_m,
    matchedLocationId: row.matched_location_id,
    matchedWifiId: row.matched_wifi_id,
    validationError: row.validation_error,
    createdAt: row.created_at,
  };
}

export class PostgresAttendanceEvidenceRepository implements IAttendanceEvidenceRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<AttendanceEvidence | null> {
    const result: QueryResult<EvidenceRow> = await this.pool.query(
      'SELECT * FROM attendance_evidences WHERE id = $1',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByRecordId(attendanceRecordId: number): Promise<AttendanceEvidence[]> {
    const result: QueryResult<EvidenceRow> = await this.pool.query(
      'SELECT * FROM attendance_evidences WHERE attendance_record_id = $1 ORDER BY client_time',
      [attendanceRecordId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateEvidenceInput): Promise<AttendanceEvidence> {
    const result: QueryResult<EvidenceRow> = await this.pool.query(
      `INSERT INTO attendance_evidences
       (employee_id, attendance_record_id, punch_type, device_id, client_time, lat, lng, accuracy_m, wifi_ssid, wifi_bssid, photo, note, gps_valid, wifi_valid, distance_m, matched_location_id, matched_wifi_id, validation_error)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [input.employeeId, input.attendanceRecordId ?? null, PUNCH_TYPE_DB[input.punchType], input.deviceId ?? null,
       input.clientTime, input.lat ?? null, input.lng ?? null,
       input.accuracyM ?? null, input.wifiSsid ?? null, input.wifiBssid ?? null,
       input.photoPath ?? null, input.note ?? null,
       input.gpsValid ?? false, input.wifiValid ?? false, input.distanceM ?? null,
       input.matchedLocationId ?? null, input.matchedWifiId ?? null, input.validationError ?? null],
    );
    return rowToEntity(result.rows[0]);
  }
}
