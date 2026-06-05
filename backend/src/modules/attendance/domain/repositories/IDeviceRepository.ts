import { Device, RegisterDeviceInput } from '../entities';

export interface IDeviceRepository {
  findById(id: number): Promise<Device | null>;
  findByUserId(userId: number): Promise<Device[]>;
  findByUid(userId: number, deviceUid: string): Promise<Device | null>;
  create(input: RegisterDeviceInput): Promise<Device>;
  updateStatus(id: number, status: Device['status']): Promise<void>;
  updateLastLogin(id: number): Promise<void>;
}
