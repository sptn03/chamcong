import { Device, RegisterDeviceInput } from '../entities';

export interface IDeviceRepository {
  findById(id: number): Promise<Device | null>;
  findByUserId(userId: number): Promise<Device[]>;
  findByUid(userId: number, deviceUid: string): Promise<Device | null>;
  findAll(companyId?: number): Promise<Device[]>;
  create(input: RegisterDeviceInput): Promise<Device>;
  updateStatus(id: number, status: Device['status'], reviewedBy?: number, rejectionReason?: string): Promise<void>;
  updateLastLogin(id: number): Promise<void>;
  updateDeviceDetails(id: number, details: Partial<RegisterDeviceInput> & { status?: Device['status'] }): Promise<void>;
  countApprovedDevices(userId: number): Promise<number>;
}
