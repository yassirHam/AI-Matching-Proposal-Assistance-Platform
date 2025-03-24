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
    const {
      page = 1,
      limit = 20,
      keyword = '',
      city = '',
      source = ''
    } = req.query;

    // Validate numeric parameters
    const pageInt = Math.max(1, parseInt(page)) || 1;
    const limitInt = Math.min(100, Math.max(1, parseInt(limit))) || 20;
    const offset = (pageInt - 1) * limitInt;

    const queryParams = [];
    const whereClauses = [];

    if (keyword) {
      whereClauses.push(`(job_title ILIKE $${queryParams.length + 1} OR description ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${keyword}%`);
    }

    if (city) {
      whereClauses.push(`j.city = $${queryParams.length + 1}`);
      queryParams.push(city);
    }

    if (source) {
      whereClauses.push(`source = $${queryParams.length + 1}`);
      queryParams.push(source);
    }

    const whereString = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM job j ${whereString}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalJobs = parseInt(countResult.rows[0].count);
    const totalPages = Math.max(1, Math.ceil(totalJobs / limitInt));

    // Validate page against actual total pages
    const validatedPage = Math.min(pageInt, totalPages);

    // Get paginated jobs
    const jobsQuery = `
      SELECT j.*, c.name as company_name, c.logo as company_logo
      FROM job j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereString}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
    `;

    const jobsResult = await pool.query(jobsQuery,
      [...queryParams, limitInt, (validatedPage - 1) * limitInt]
    );

    res.json({
      success: true,
      data: {
        jobs: jobsResult.rows,
        total: totalJobs,
        totalPages: totalPages,
        currentPage: validatedPage,
        limit: limitInt
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
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
    const result = await pool.query(`
      SELECT j.*, c.name as company_name, c.logo as company_logo
      FROM job j
      LEFT JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        jobs: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error("Get admin jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin jobs"
    });
  }
};