export interface AppNotification {
  id: number;
  userId: number;
  message: string;
  action: string;
  route: string;
  status: 'READ' | 'UNREAD';
  timestamp: string;
}
