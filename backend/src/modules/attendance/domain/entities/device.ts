export type DevicePlatform = 'ios' | 'android';
export type DeviceStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface Device {
  id: number;
  userId: number;
  deviceUid: string;
  deviceName: string | null;
  platform: DevicePlatform;
  osVersion: string | null;
  appVersion: string | null;
  pushToken: string | null;
  status: DeviceStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDeviceInput {
  userId: number;
  deviceUid: string;
  deviceName?: string;
  platform: DevicePlatform;
  osVersion?: string;
  appVersion?: string;
  pushToken?: string;
}
