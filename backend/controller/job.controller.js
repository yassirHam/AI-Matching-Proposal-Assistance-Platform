import pool from '../utils/db.js';

export const postJob = async (req, res) => {
  try {
    const { jobTitle, city, jobLink, source, company_id } = req.body;

    // Validate required fields
    if (!jobTitle || !city || !jobLink || !source) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: jobTitle, city, jobLink, source"
      });
    }

    // Insert job with optional company_id
    const result = await pool.query(
      `INSERT INTO job (job_title, city, job_link, source, company_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [jobTitle, city, jobLink, source, company_id || null]
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Post job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { keyword = "", page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Base query
    const query = {
      text: `SELECT j.*, c.name as company_name, c.logo as company_logo
             FROM job j
             LEFT JOIN companies c ON j.company_id = c.id
             WHERE j.job_title ILIKE $1 OR j.city ILIKE $1
             ORDER BY j.created_at DESC
             LIMIT $2 OFFSET $3`,
      values: [`%${keyword}%`, limit, offset]
    };

    // Count query
    const countQuery = {
      text: `SELECT COUNT(*) FROM job 
             WHERE job_title ILIKE $1 OR city ILIKE $1`,
      values: [`%${keyword}%`]
    };

    const [jobsResult, countResult] = await Promise.all([
      pool.query(query),
      pool.query(countQuery)
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs: jobsResult.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs"
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, c.name as company_name, c.logo as company_logo
       FROM job j
       LEFT JOIN companies c ON j.company_id = c.id
       WHERE j.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job details"
    });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, c.name as company_name
       FROM job j
       LEFT JOIN companies c ON j.company_id = c.id
       ORDER BY j.created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Get admin jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin jobs"
    });
  }
};