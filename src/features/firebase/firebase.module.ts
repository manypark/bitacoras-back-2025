import { join } from 'path';
import { readFileSync } from 'fs';
import { Module, Global } from '@nestjs/common';

import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        const serviceAccount = JSON.parse(
          readFileSync(join(process.cwd(), 'src/config/firebase-adminsdk.json'), 'utf8'),
        );

        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}