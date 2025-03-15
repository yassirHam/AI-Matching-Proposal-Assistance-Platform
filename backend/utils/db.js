import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
 connectionTimeoutMillis: 5000, // 5 seconds timeout for connection acquisition
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  max: 20, // Maximum number of clients in the pool
});

pool.on('connect', client => {
  console.log('🛢️  Database connection established');
});

pool.on('error', err => {
  console.error('💥 Database error:', err);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Executed query in ${duration}ms`);
    return res;
  } catch (error) {
    console.error('❌ Query error:', { text, params });
    throw error;
  }
};

export default pool;