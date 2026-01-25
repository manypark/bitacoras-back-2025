import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const caPath = path.resolve(process.cwd(), process.env.DB_SSL_CA_PATH!);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DN_NAME,
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(caPath).toString(),
  },
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
});
