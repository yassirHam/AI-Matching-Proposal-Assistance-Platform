import { query } from "../utils/db.js";
import { v4 as uuidv4 } from 'uuid';

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        const existingApp = await pool.query(
            'SELECT * FROM applications WHERE job_id = $1 AND applicant_id = $2',
            [jobId, userId]
        );

        if (existingApp.rows.length > 0) {
            return res.status(400).json({
                message: "You have already applied for this job",
                success: false
            });
        }

        const newApplication = await pool.query(
            `INSERT INTO applications (job_id, applicant_id, status)
             VALUES ($1, $2, 'pending')
             RETURNING *`,
            [jobId, userId]
        );

        res.status(201).json({
            message: "Job applied successfully",
            success: true,
            application: newApplication.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const result = await pool.query(`
            SELECT a.*, j.job_title, j.city, j.job_link, j.source, 
                   c.name AS company_name, c.logo AS company_logo
            FROM applications a
            JOIN job j ON a.job_id = j.id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE a.applicant_id = $1
            ORDER BY a.created_at DESC
        `, [userId]);

        res.status(200).json({
            applications: result.rows,
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const result = await pool.query(`
            SELECT a.*, u.fullname, u.email, u.phone_number, u.profile_photo
            FROM applications a
            JOIN users u ON a.applicant_id = u.id
            WHERE a.job_id = $1
            ORDER BY a.created_at DESC
        `, [jobId]);

        res.status(200).json({
            applicants: result.rows,
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!['pending', 'accepted', 'rejected'].includes(status?.toLowerCase())) {
            return res.status(400).json({
                message: "Invalid status value",
                success: false
            });
        }

        const result = await pool.query(`
            UPDATE applications
            SET status = $1
            WHERE id = $2
            RETURNING *
        `, [status.toLowerCase(), applicationId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Status updated successfully",
            application: result.rows[0],
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};