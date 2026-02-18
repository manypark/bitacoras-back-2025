import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebase: admin.app.App,
  ) {}

  async sendNotification(token: string, title: string, body: string) {
    if (!token) return;

    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    });
  }
}
