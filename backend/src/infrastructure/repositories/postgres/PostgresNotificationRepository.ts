import { Pool, QueryResult } from 'pg';
import { INotificationRepository } from '../../../modules/attendance/domain/repositories';
import { Notification } from '../../../modules/attendance/domain/entities';

interface NotificationRow {
  id: number;
  company_id: number | null;
  user_id: number;
  type: string;
  title: string;
  body: string | null;
  data_json: unknown | null;
  read_at: Date | null;
  created_at: Date;
}

function rowToEntity(row: NotificationRow): Notification {
  return {
    id: row.id,
    companyId: row.company_id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    dataJson: row.data_json,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export class PostgresNotificationRepository implements INotificationRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Notification | null> {
    const result: QueryResult<NotificationRow> = await this.pool.query(
      'SELECT * FROM notifications WHERE id = $1',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const result: QueryResult<NotificationRow> = await this.pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset],
    );
    return result.rows.map(rowToEntity);
  }

  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    const result: QueryResult<NotificationRow> = await this.pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND read_at IS NULL ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: Partial<Notification>): Promise<Notification> {
    const result: QueryResult<NotificationRow> = await this.pool.query(
      `INSERT INTO notifications (company_id, user_id, type, title, body, data_json)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.companyId ?? null, input.userId, input.type, input.title,
       input.body ?? null, input.dataJson ? JSON.stringify(input.dataJson) : null],
    );
    return rowToEntity(result.rows[0]);
  }

  async markAsRead(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE notifications SET read_at = NOW() WHERE id = $1 AND read_at IS NULL',
      [id],
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.pool.query(
      'UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL',
      [userId],
    );
  }
}
