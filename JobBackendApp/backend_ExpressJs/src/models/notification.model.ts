import { Schema, model, type InferSchemaType } from 'mongoose';
import { NOTIFICATION_STATUSES } from '../constants/enums.js';

/** `notification` collection (singular, as in Spring's @Document). */
const notificationSchema = new Schema(
  {
    _id: { type: Number, required: true },
    userId: { type: Number, required: true },
    message: String,
    action: String,
    route: String,
    status: { type: String, enum: NOTIFICATION_STATUSES, default: 'UNREAD' },
    timestamp: Date,
  },
  { collection: 'notification', versionKey: false },
);

notificationSchema.index({ userId: 1, status: 1 });

export type NotificationDoc = InferSchemaType<typeof notificationSchema>;
export const Notification = model('Notification', notificationSchema);
