import pool from '../utils/db.js';

export const createJobOffer = async (jobData) => {
  const { job_title, city, job_link, source, company_id } = jobData;

  const query = `
    INSERT INTO job 
    (job_title, city, job_link, source, created_at, company_id)
    VALUES ($1, $2, $3, $4, NOW(), $5)
    RETURNING *;
  `;

  const values = [job_title, city, job_link, source, company_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getJobOffers = async () => {
  const query = `SELECT * FROM job;`;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const getJobOfferById = async (jobId) => {
  const query = `SELECT * FROM job WHERE id = $1;`;

  try {
    const result = await pool.query(query, [jobId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const updateJobOffer = async (jobId, updates) => {
  const { job_title, city, job_link, source, company_id } = updates;

  const query = `
    UPDATE job
    SET job_title = $1, city = $2, job_link = $3, source = $4, company_id = $5
    WHERE id = $6
    RETURNING *;
  `;

  const values = [job_title, city, job_link, source, company_id, jobId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const deleteJobOffer = async (jobId) => {
  const query = `DELETE FROM job WHERE id = $1 RETURNING *;`;

  try {
    const result = await pool.query(query, [jobId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};