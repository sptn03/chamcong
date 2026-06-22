export interface LoginDto {
  phone: string;
  password: string;
  deviceUid?: string;
  deviceName?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
}

export interface HunonicLoginDto {
  hunonicToken: string;
  phone?: string;
  deviceUid?: string;
  deviceName?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
}

export interface TokenDto {
  token: string;
  userId: number;
  deviceId: number | null;
  createdAt: string;
  activeCompanyId?: number | null;
  activeEmployeeId?: number | null;
}

export interface HunonicPasswordLoginDto {
  phone: string;
  password: string;
  deviceUid?: string;
  deviceName?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
}

export interface LogoutDto {
  token: string;
}
