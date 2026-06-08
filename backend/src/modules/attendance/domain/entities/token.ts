export interface Token {
  id: number;
  userId: number;
  deviceId: number | null;
  token: string;
  active: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  activeCompanyId: number | null;
  activeEmployeeId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTokenInput {
  userId: number;
  deviceId?: number;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  activeCompanyId?: number | null;
  activeEmployeeId?: number | null;
}
