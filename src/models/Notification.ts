import { Schema, model } from 'mongoose';
import { INotification } from '../interfaces/Notification.interface';

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default model<INotification>('Notification', notificationSchema);