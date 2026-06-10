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
  /** Token từ Hunonic sau khi xác thực bên Hunonic */
  hunonicToken: string;
  /** Email hoặc phone để map user (nếu cần) */
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
