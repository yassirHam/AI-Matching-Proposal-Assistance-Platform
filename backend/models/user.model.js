import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';
import { handleDBError } from '../utils/dbErrors.js'; // Add this helper

export const createUser = async (userData) => {
  const { fullname, email, phone_number, password, role } = userData;

  if (!password || typeof password !== 'string') {
    const error = new Error('Password is required and must be a string');
    error.statusCode = 400;
    throw error;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const query = `
      INSERT INTO users 
      (fullname, email, phone_number, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [fullname, email, phone_number, hashedPassword, role];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    error.context = { action: 'user-creation', email };
    throw handleDBError(error);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const query = `SELECT * FROM users WHERE email = $1;`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    error.context = { action: 'get-user', email };
    throw handleDBError(error);
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { bio, skills, resume, resume_original_name, profile_photo } = updates;
    const query = `
      UPDATE users
      SET bio = $1, skills = $2, resume = $3, 
          resume_original_name = $4, profile_photo = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [bio, skills, resume, resume_original_name, profile_photo, userId];

    const result = await pool.query(query, values);
    if (!result.rowCount) throw new Error('User not found');
    return result.rows[0];
  } catch (error) {
    error.context = { action: 'update-profile', userId };
    throw handleDBError(error);
  }
};

export const deleteUser = async (userId) => {
  try {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [userId]);

    if (!result.rowCount) {
      const notFoundError = new Error('User not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    return result.rows[0];
  } catch (error) {
    error.context = { action: 'delete-user', userId };
    throw handleDBError(error);
  }
};