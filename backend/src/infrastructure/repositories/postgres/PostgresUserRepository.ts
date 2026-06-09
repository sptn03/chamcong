import { Pool, QueryResult } from 'pg';
import { IUserRepository } from '../../../modules/attendance/domain/repositories';
import { User } from '../../../modules/attendance/domain/entities';

interface UserRow {
  id: number;
  phone: string;
  email: string | null;
  pass: string | null;
  full_name: string;
  birthday: string | null;
  gender: number | null;
  is_hunonic: boolean;
  hunonic_sub: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
}

const USER_STATUS_MAP: Record<number, string> = { 1: 'active', 2: 'locked' };
const GENDER_TYPE_MAP: Record<number, string> = { 1: 'male', 2: 'female', 3: 'other' };

function rowToEntity(row: UserRow): User {
  return {
    id: row.id,
    phone: row.phone,
    email: row.email,
    passwordHash: row.pass,
    fullName: row.full_name,
    birthday: row.birthday,
    gender: row.gender != null ? GENDER_TYPE_MAP[row.gender] ?? null : null,
    isHunonic: row.is_hunonic,
    hunonicSub: row.hunonic_sub,
    status: USER_STATUS_MAP[row.status] as User['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<User | null> {
    const result: QueryResult<UserRow> = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const result: QueryResult<UserRow> = await this.pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result: QueryResult<UserRow> = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }
}
