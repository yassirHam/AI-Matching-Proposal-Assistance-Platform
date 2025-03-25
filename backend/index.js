import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pg from 'pg';
const { Pool } = pg;
import userRoute from "./routes/user.routes.js";
import companyRoute from "./routes/company.routes.js";
import jobRoute from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDatabase = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("🟢 Connected to PostgreSQL database");
    await client.query(`
      CREATE TABLE IF NOT EXISTS job (
        id SERIAL PRIMARY KEY,
        job_title TEXT NOT NULL,
        city TEXT NOT NULL,
        job_link TEXT NOT NULL,
        source TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        company_id INTEGER
      );
    `);
    console.log("✅ Verified jobs table existence");

  } catch (err) {
    console.error("🔴 Database initialization failed:", err);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
};

initializeDatabase();

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later'
}));

const corsOptions = {
  origin: process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Content-Disposition',
    'x-requested-with'
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  req.db = pool;
  next();
});

app.get('/api/v1/jobs', async (req, res) => {
  try {
    const { rows: jobs } = await req.db.query(`
      SELECT id, job_title, city, job_link, source, created_at, company_id
      FROM job
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: jobs.map(job => ({
        id: job.id,
        job_title: job.job_title,
        city: job.city,
        job_link: job.job_link,
        source: job.source,
        created_at: job.created_at,
        company_id: job.company_id
      }))
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/companies", companyRoute);
app.use("/api/v1/jobs", jobRoute);
app.use("/api/v1/applications", applicationRoutes);

app.get('/api/v1/health', async (req, res) => {
  try {
    await req.db.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

const shutdown = async () => {
  console.log('🔴 Closing database pool');
  await pool.end();
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', shutdown);
process.on('uncaughtException', shutdown);