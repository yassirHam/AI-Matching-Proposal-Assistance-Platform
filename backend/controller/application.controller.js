import pool from "../utils/db.js";
export const applyJob = async (req, res) => {
    try {
        const userId = req.user.id; // Changed from req.id to req.user.id
        const jobId = req.params.id;

        // Verify job exists
        const jobCheck = await pool.query(
            'SELECT id FROM job WHERE id = $1',
            [jobId]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

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
        const userId = req.user.id;  // Using req.user.id from authentication middleware

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
            success: true,
            applications: result.rows  // Ensure this matches what frontend expects
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch applications"
        });
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