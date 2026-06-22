import { Device } from '../../domain/entities';
import { toVNTime, toVNTimeNullable } from '../../../../shared/utils/datetime';

export interface DeviceDto {
  id: number;
  userId: number;
  userName?: string;
  deviceUid: string;
  deviceName: string | null;
  platform: string;
  osVersion: string | null;
  appVersion: string | null;
  pushToken: string | null;
  status: string;
  lastLoginAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export function deviceToDto(entity: Device): DeviceDto {
  return {
    id: entity.id,
    userId: entity.userId,
    userName: entity.userName,
    deviceUid: entity.deviceUid,
    deviceName: entity.deviceName,
    platform: entity.platform,
    osVersion: entity.osVersion,
    appVersion: entity.appVersion,
    pushToken: entity.pushToken,
    status: entity.status,
    lastLoginAt: toVNTimeNullable(entity.lastLoginAt),
    ipAddress: entity.ipAddress,
    userAgent: entity.userAgent,
    reviewedBy: entity.reviewedBy,
    reviewedAt: toVNTimeNullable(entity.reviewedAt),
    rejectionReason: entity.rejectionReason,
    createdAt: toVNTime(entity.createdAt),
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
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateDeviceStatusDto {
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  reviewedBy?: number;
  rejectionReason?: string;
}
