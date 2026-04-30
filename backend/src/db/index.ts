import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
import * as schema from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any;
let pool: mysql.Pool;

export async function createDbConnection() {
  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    timezone: '+00:00',
  });

  db = drizzle(pool, { schema, mode: 'default' });

  // Test connection
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();

  console.log('✅ Database connected successfully');
  return db;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  if (!db) {
    throw new Error('Database not initialized. Call createDbConnection() first.');
  }
  return db;
}

export { schema };
export default db!;
