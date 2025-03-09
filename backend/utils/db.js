import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(poolConfig);

const connectDB = () => {
  return pool.query('SELECT NOW()')
    .then((res) => {
      console.log('PostgreSQL Connected...', res.rows[0]);
      return pool;
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      throw err;
    });
};

export { pool, connectDB };