export interface Token {
  id: number;
  userId: number;
  deviceId: number | null;
  token: string;
  active: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTokenInput {
  userId: number;
  deviceId?: number;
  token: string;
  ipAddress?: string;
  userAgent?: string;
}
