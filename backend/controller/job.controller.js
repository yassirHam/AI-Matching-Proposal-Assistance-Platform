import { pool } from "../utils/db.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        const result = await pool.query(`
            INSERT INTO job_offers (
                title, description, requirements, salary, 
                experience_level, location, job_type, position,
                company_id, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            title, description, requirements, salary,
            experience, location, jobType, position,
            companyId, userId
        ]);

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

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = `
            SELECT j.*, c.name AS company_name, c.logo AS company_logo
            FROM job_offers j
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE 
                j.title ILIKE $1 OR 
                j.description ILIKE $1
            ORDER BY j.created_at DESC
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
            SELECT j.*, c.name AS company_name, c.logo AS company_logo,
                   COUNT(a.id) AS application_count
            FROM job_offers j
            LEFT JOIN companies c ON j.company_id = c.id
            LEFT JOIN applications a ON j.id = a.job_id
            WHERE j.id = $1
            GROUP BY j.id, c.name, c.logo
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
        const adminId = req.id;
        const result = await pool.query(`
            SELECT j.*, c.name AS company_name
            FROM job_offers j
            JOIN companies c ON j.company_id = c.id
            WHERE j.created_by = $1
            ORDER BY j.created_at DESC
        `, [adminId]);

        res.status(200).json({
            jobs: result.rows,
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};