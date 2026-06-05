export interface Notification {
  id: number;
  companyId: number | null;
  userId: number;
  type: string;
  title: string;
  body: string | null;
  dataJson: unknown | null;
  readAt: Date | null;
  createdAt: Date;
}
