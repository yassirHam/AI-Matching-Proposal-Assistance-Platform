import { pool } from "../utils/db.js";

export const postJob = async (req, res) => {
  try {
    const { jobTitle, city, jobLink, source } = req.body;

    const result = await pool.query(`
      INSERT INTO job (job_title, city, job_link, source)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [jobTitle, city, jobLink, source]);

    res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0],
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Retrieves all jobs by searching job_title and city using a keyword
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = `
      SELECT *
      FROM job
      WHERE 
        job_title ILIKE $1 OR 
        city ILIKE $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [`%${keyword}%`]);

    res.status(200).json({
      jobs: result.rows,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const result = await pool.query(`
      SELECT *
      FROM job
      WHERE id = $1
    `, [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found",
        success: false
      });
    }

    res.status(200).json({
      job: result.rows[0],
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM job
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      jobs: result.rows,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
