import { INotificationRepository } from '../../domain/repositories';
import { NotificationDto, notificationToDto } from '../dto';
import { NotFoundError } from '../../../../shared/errors';

export class NotificationUsecase {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async getById(id: number): Promise<NotificationDto> {
    const entity = await this.notifRepo.findById(id);
    if (!entity) throw new NotFoundError('Notification not found');
    return notificationToDto(entity);
  }

  async getByUser(userId: number, limit?: number, offset?: number): Promise<NotificationDto[]> {
    const entities = await this.notifRepo.findByUserId(userId, limit, offset);
    return entities.map(notificationToDto);
  }

  async getUnreadByUser(userId: number): Promise<NotificationDto[]> {
    const entities = await this.notifRepo.findUnreadByUserId(userId);
    return entities.map(notificationToDto);
  }

  async markAsRead(id: number): Promise<void> {
    await this.notifRepo.markAsRead(id);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notifRepo.markAllAsRead(userId);
  }
}
