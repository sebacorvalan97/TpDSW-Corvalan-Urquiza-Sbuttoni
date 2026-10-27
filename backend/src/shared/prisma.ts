import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

const requiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Falta configurar ${name} en backend/.env`);
  return value;
};

const port = Number(process.env.DATABASE_PORT ?? 3306);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DATABASE_PORT debe ser un puerto válido entre 1 y 65535.');
}

const host = requiredEnvironmentVariable('DATABASE_HOST');
const isLocalDatabase = ['localhost', '127.0.0.1', '::1'].includes(host.toLowerCase());

const adapter = new PrismaMariaDb({
  host,
  port,
  user: requiredEnvironmentVariable('DATABASE_USER'),
  password: requiredEnvironmentVariable('DATABASE_PASSWORD'),
  database: requiredEnvironmentVariable('DATABASE_NAME'),
  connectionLimit: 5,
  allowPublicKeyRetrieval: isLocalDatabase,
});

export const prisma = new PrismaClient({ adapter });
