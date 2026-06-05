import { Device } from '../../domain/entities';

export interface DeviceDto {
  id: number;
  userId: number;
  deviceUid: string;
  deviceName: string | null;
  platform: string;
  osVersion: string | null;
  appVersion: string | null;
  pushToken: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export function deviceToDto(entity: Device): DeviceDto {
  return {
    id: entity.id,
    userId: entity.userId,
    deviceUid: entity.deviceUid,
    deviceName: entity.deviceName,
    platform: entity.platform,
    osVersion: entity.osVersion,
    appVersion: entity.appVersion,
    pushToken: entity.pushToken,
    status: entity.status,
    lastLoginAt: entity.lastLoginAt?.toISOString() ?? null,
    createdAt: entity.createdAt.toISOString(),
  };
}

export interface RegisterDeviceDto {
  userId: number;
  deviceUid: string;
  deviceName?: string;
  platform: 'ios' | 'android';
  osVersion?: string;
  appVersion?: string;
  pushToken?: string;
}

export interface UpdateDeviceStatusDto {
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
}
