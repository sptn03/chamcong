import { User } from '../entities';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: Partial<User> & { password?: string }): Promise<User>;
  update(id: number, input: Partial<User> & { password?: string }): Promise<User>;
  verifyPassword(id: number, password: string): Promise<boolean>;
  findHunonicUserByPhoneOrEmail(phone?: string, email?: string): Promise<User | null>;
}
