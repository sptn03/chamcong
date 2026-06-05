import { Notification } from '../../domain/entities';

export interface NotificationDto {
  id: number;
  companyId: number | null;
  userId: number;
  type: string;
  title: string;
  body: string | null;
  dataJson: unknown | null;
  readAt: string | null;
  createdAt: string;
}

export function notificationToDto(entity: Notification): NotificationDto {
  return {
    id: entity.id,
    companyId: entity.companyId,
    userId: entity.userId,
    type: entity.type,
    title: entity.title,
    body: entity.body,
    dataJson: entity.dataJson,
    readAt: entity.readAt?.toISOString() ?? null,
    createdAt: entity.createdAt.toISOString(),
  };
}
