import pool from "../utils/db.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const userId = req.id;

        const existingCompany = await pool.query(
            'SELECT * FROM companies WHERE name = $1',
            [name]
        );

        if (existingCompany.rows.length > 0) {
            return res.status(400).json({
                message: "Company already exists",
                success: false
            });
        }

        const newCompany = await pool.query(
            `INSERT INTO companies 
             (name, description, website, location, user_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, description, website, location, userId]
        );

        res.status(201).json({
            message: "Company registered successfully",
            company: newCompany.rows[0],
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // Get user ID from authentication middleware
        const result = await pool.query(
            'SELECT * FROM companies WHERE user_id = $1',
            [userId]
        );

        res.status(200).json({
            companies: result.rows,
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const result = await pool.query(
            'SELECT * FROM companies WHERE id = $1',
            [companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        res.status(200).json({
            company: result.rows[0],
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const companyId = req.params.id;
        const file = req.file;

        let logoUrl = null;
        if (file) {
            const cloudResponse = await cloudinary.uploader.upload(file.path);
            logoUrl = cloudResponse.secure_url;
        }

        const updateQuery = `
            UPDATE companies
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                website = COALESCE($3, website),
                location = COALESCE($4, location),
                logo = COALESCE($5, logo)
            WHERE id = $6
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [
            name, description, website, location, logoUrl, companyId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Company updated successfully",
            company: result.rows[0],
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const result = await pool.query(
            'DELETE FROM companies WHERE id = $1 RETURNING *',
            [companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Company deleted successfully",
            company: result.rows[0],
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};