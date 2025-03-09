import pool from '../utils/db.js';

export const createApplication = async (applicationData) => {
  const { job_id, applicant_id, status } = applicationData;

  const query = `
    INSERT INTO applications 
    (job_id, applicant_id, status)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [job_id, applicant_id, status || 'pending'];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getApplicationsByApplicant = async (applicantId) => {
  const query = `
    SELECT * FROM applications 
    WHERE applicant_id = $1;
  `;

  try {
    const result = await pool.query(query, [applicantId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const getApplicationsForJob = async (jobId) => {
  const query = `
    SELECT * FROM applications 
    WHERE job_id = $1;
  `;

  try {
    const result = await pool.query(query, [jobId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId, newStatus) => {
  const query = `
    UPDATE applications
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [newStatus, applicationId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const deleteApplication = async (applicationId) => {
  const query = `DELETE FROM applications WHERE id = $1 RETURNING *;`;

  try {
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};