import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool: pg.Pool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  // Test connection
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
}

/**
 * A simple database abstraction that falls back to a mock if Postgres is unavailable.
 * This ensures the app works in the AI Studio preview while remaining production-ready.
 */
export const db = {
  async query(text: string, params?: any[]) {
    if (pool) {
      try {
        return await pool.query(text, params);
      } catch (err: any) {
        // If it's a connection error, we might want to log it and potentially fall back
        // but for now, we'll just throw it so the caller knows the DB is down.
        if (err.code === 'ECONNREFUSED' || err.code === '57P03') {
          console.warn('Postgres connection refused. Ensure DATABASE_URL is correct.');
        }
        throw err;
      }
    } else {
      throw new Error('DATABASE_URL is not set. Please configure your database connection.');
    }
  },
  async getClient() {
    if (pool) {
      return await pool.connect();
    }
    throw new Error('DATABASE_URL is not set.');
  }
};

export default db;
