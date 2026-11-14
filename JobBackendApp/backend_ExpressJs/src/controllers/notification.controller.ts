import type { Request, Response } from 'express';
import { currentUser } from '../middlewares/authenticate.js';
import * as notificationService from '../services/notification.service.js';
import { AppError } from '../utils/app-error.js';

/** GET /notification/get/:userId -> 200 unread notifications (own only) */
export async function getNotifications(req: Request, res: Response) {
  const user = currentUser(req);
  const userId: number = res.locals.params.userId;
  if (userId !== user.id && user.accountType !== 'ADMIN') throw new AppError('FORBIDDEN');
  res.json(await notificationService.getUnreadNotifications(userId));
}

/** PUT /notification/read/:id -> 200 `{ message }` */
export async function readNotification(req: Request, res: Response) {
  await notificationService.readNotification(res.locals.params.id, currentUser(req));
  res.json({ message: 'Success' });
}
