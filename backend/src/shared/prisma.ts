import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

const requiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Falta configurar ${name} en backend/.env o DATABASE_URL`);
  return value;
};

const resolveDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl && !process.env.DATABASE_HOST) {
    const parsed = new URL(databaseUrl);
    const host = parsed.hostname;
    const port = Number(parsed.port || 3306);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('El puerto en DATABASE_URL debe ser un puerto válido entre 1 y 65535.');
    }
    const isLocalDatabase = ['localhost', '127.0.0.1', '::1'].includes(host.toLowerCase());
    const sslDisabled =
      process.env.DATABASE_SSL === 'false' ||
      parsed.searchParams.get('ssl-mode')?.toUpperCase() === 'DISABLED';

    return {
      host,
      port,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, '') || 'defaultdb',
      isLocalDatabase,
      useSsl: !isLocalDatabase && !sslDisabled,
    };
  }

  const port = Number(process.env.DATABASE_PORT ?? 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DATABASE_PORT debe ser un puerto válido entre 1 y 65535.');
  }

  const host = requiredEnvironmentVariable('DATABASE_HOST');
  const isLocalDatabase = ['localhost', '127.0.0.1', '::1'].includes(host.toLowerCase());
  const sslDisabled = process.env.DATABASE_SSL === 'false';

  return {
    host,
    port,
    user: requiredEnvironmentVariable('DATABASE_USER'),
    password: requiredEnvironmentVariable('DATABASE_PASSWORD'),
    database: requiredEnvironmentVariable('DATABASE_NAME'),
    isLocalDatabase,
    useSsl: !isLocalDatabase && !sslDisabled,
  };
};

const config = resolveDatabaseConfig();

const adapter = new PrismaMariaDb({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
  ...(config.useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

export const prisma = new PrismaClient({ adapter });
