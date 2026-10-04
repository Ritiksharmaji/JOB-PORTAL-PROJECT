import { Notification } from '../models/notification.model.js';
import { nextSequenceId } from '../models/sequence.model.js';
import { AppError } from '../utils/app-error.js';
import { toNotificationDto } from '../utils/mappers.js';

export interface NewNotification {
  userId: number;
  action: string;
  message: string;
  route?: string;
}

export async function sendNotification(input: NewNotification): Promise<void> {
  await Notification.create({
    _id: await nextSequenceId('notification'),
    ...input,
    status: 'UNREAD',
    timestamp: new Date(),
  });
}

export async function getUnreadNotifications(userId: number) {
  const list = await Notification.find({ userId, status: 'UNREAD' }).sort({ timestamp: -1 }).lean();
  return list.map(toNotificationDto);
}

/** Marks a notification as read. Only its owner (or an admin) may do this. */
export async function readNotification(id: number, requester: { id: number; accountType: string }): Promise<void> {
  const noti = await Notification.findById(id);
  if (!noti) throw new AppError('NOTIFICATION_NOT_FOUND');
  if (noti.userId !== requester.id && requester.accountType !== 'ADMIN') throw new AppError('FORBIDDEN');
  noti.status = 'READ';
  await noti.save();
}
