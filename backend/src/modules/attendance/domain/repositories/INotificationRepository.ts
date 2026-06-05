import { Notification } from '../entities';

export interface INotificationRepository {
  findById(id: number): Promise<Notification | null>;
  findByUserId(userId: number, limit?: number, offset?: number): Promise<Notification[]>;
  findUnreadByUserId(userId: number): Promise<Notification[]>;
  create(input: Partial<Notification>): Promise<Notification>;
  markAsRead(id: number): Promise<void>;
  markAllAsRead(userId: number): Promise<void>;
}
