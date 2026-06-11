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

  async create(input: Partial<User> & { password?: string }): Promise<User> {
    const genderDb = input.gender ? (input.gender === 'male' ? 1 : input.gender === 'female' ? 2 : 3) : 3;
    const statusDb = input.status === 'locked' ? 2 : 1;
    const result: QueryResult<UserRow> = await this.pool.query(
      `INSERT INTO users (phone, email, pass, full_name, birthday, gender, status, is_hunonic)
       VALUES ($1, $2, CASE WHEN $3::text IS NOT NULL THEN crypt($3, gen_salt('bf')) ELSE NULL END, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.phone,
        input.email ?? null,
        input.password ?? null,
        input.fullName,
        input.birthday ?? null,
        genderDb,
        statusDb,
        input.isHunonic ?? false,
      ]
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: Partial<User> & { password?: string }): Promise<User> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.fullName !== undefined) { fields.push(`full_name = $${paramIndex++}`); values.push(input.fullName); }
    if (input.phone !== undefined) { fields.push(`phone = $${paramIndex++}`); values.push(input.phone); }
    if (input.email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(input.email); }
    if (input.birthday !== undefined) { fields.push(`birthday = $${paramIndex++}`); values.push(input.birthday); }
    if (input.gender !== undefined) { 
      fields.push(`gender = $${paramIndex++}`); 
      values.push(input.gender === 'male' ? 1 : input.gender === 'female' ? 2 : 3); 
    }
    if (input.isHunonic !== undefined) { fields.push(`is_hunonic = $${paramIndex++}`); values.push(input.isHunonic); }
    if (input.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(input.status === 'locked' ? 2 : 1);
    }
    if (input.password !== undefined && input.password !== '') {
      fields.push(`pass = crypt($${paramIndex++}, gen_salt('bf'))`);
      values.push(input.password);
    }

    if (fields.length === 0) {
      return (await this.findById(id))!;
    }

    values.push(id);
    const result: QueryResult<UserRow> = await this.pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rowToEntity(result.rows[0]);
  }

  async verifyPassword(id: number, password?: string): Promise<boolean> {
    if (!password) return false;
    const result = await this.pool.query(
      'SELECT crypt($1, pass) = pass AS valid FROM users WHERE id = $2',
      [password, id]
    );
    return !!result.rows[0]?.valid;
  }

  async findHunonicUserByPhoneOrEmail(phone?: string, email?: string): Promise<User | null> {
    let result: QueryResult<UserRow>;
    if (phone) {
      result = await this.pool.query(
        'SELECT * FROM users WHERE phone = $1 AND is_hunonic = TRUE',
        [phone]
      );
      if (result.rows.length) return rowToEntity(result.rows[0]);
    }
    if (email) {
      result = await this.pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_hunonic = TRUE',
        [email]
      );
      if (result.rows.length) return rowToEntity(result.rows[0]);
    }
    return null;
  }
}
