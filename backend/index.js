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
import applicationRoute from "./routes/application.routes.js";

const app = express();

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log("🟢 Connected to PostgreSQL database");
    client.release();
  })
  .catch(err => {
    console.error("🔴 Database connection failed:", err);
    process.exit(1);
  });

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// CORS configuration
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

// Body parsing middleware (for non-file routes)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Database middleware
app.use((req, res, next) => {
  req.db = pool;
  next();
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/companies", companyRoute);
app.use("/api/v1/jobs", jobRoute);
app.use("/api/v1/applications", applicationRoute);

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

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server setup
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Shutdown handlers
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
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  shutdown();
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  shutdown();
});