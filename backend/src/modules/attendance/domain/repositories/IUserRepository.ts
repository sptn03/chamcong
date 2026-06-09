import { User } from '../entities';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
