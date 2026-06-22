export type UserStatus = 'active' | 'locked';

export interface User {
  id: number;
  phone: string;
  email: string | null;
  passwordHash: string | null;
  fullName: string;
  birthday: string | null;
  gender: string | null;
  isHunonic: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  phone: string;
  email?: string;
  passwordHash?: string;
  fullName?: string;
  birthday?: string;
  gender?: string;
  isHunonic?: boolean;
}
