import pool from '../utils/db.js';

export const createCompany = async (companyData) => {
  const { name, description, website, location, logo, user_id } = companyData;

  const query = `
    INSERT INTO companies 
    (name, description, website, location, logo, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [name, description, website, location, logo, user_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getCompanyByUserId = async (userId) => {
  const query = `SELECT * FROM companies WHERE user_id = $1;`;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const updateCompany = async (companyId, updates) => {
  const { name, description, website, location, logo } = updates;

  const query = `
    UPDATE companies
    SET name = $1, description = $2, website = $3, 
        location = $4, logo = $5
    WHERE id = $6
    RETURNING *;
  `;

  const values = [name, description, website, location, logo, companyId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const deleteCompany = async (companyId) => {
  const query = `DELETE FROM companies WHERE id = $1 RETURNING *;`;

  try {
    const result = await pool.query(query, [companyId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};