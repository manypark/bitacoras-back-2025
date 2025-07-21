import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './features/auth/auth.module';
import { RolesModule } from './features/roles/roles.module';
import { MenuModule } from './features/menu/menu.module';
import { MenuRolesModule } from './features/menu-roles/menu-roles.module';

@Module({
  imports     : [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT?.toString()!,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DN_NAME,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      useUTC:true,
      extra: {
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync( __dirname + process.env.DB_SSL_CA_PATH ).toString(),
        },
        options: '-c timezone=UTC',
      }
    }),
    AuthModule,
    RolesModule,
    MenuModule,
    MenuRolesModule,
  ],
})
export class AppModule {}
