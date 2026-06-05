import { AttendanceEvidence, CreateEvidenceInput } from '../entities';

export interface IAttendanceEvidenceRepository {
  findById(id: number): Promise<AttendanceEvidence | null>;
  findByRecordId(attendanceRecordId: number): Promise<AttendanceEvidence[]>;
  create(input: CreateEvidenceInput): Promise<AttendanceEvidence>;
}
