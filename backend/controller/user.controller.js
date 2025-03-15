
import pool from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import fs from 'fs';

export const register = async (req, res) => {
    try {
        const { fullname, email, phone_number, password, role } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Profile photo is required"
            });
        }

        // Check existing user
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }

        // Upload to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(file.path);
        const profile_photo = cloudResponse.secure_url;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await pool.query(`
            INSERT INTO users (
                fullname, email, phone_number, password, role, profile_photo
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, fullname, email, phone_number, role, profile_photo
        `, [fullname, email, phone_number, hashedPassword, role, profile_photo]);

        res.status(201).json({
            message: "Registration successful",
            user: newUser.rows[0],
            success: true
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Cleanup uploaded file
        if (req.file) fs.unlinkSync(req.file.path);

        res.status(500).json({
            message: "Registration failed",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullname, email, phone_number, bio, skills } = req.body;

        // Handle both potential file uploads
        const profilePhotoFile = req.files?.['profile_photo']?.[0];
        const resumeFile = req.files?.['resume']?.[0];

        const updates = [];
        const values = [];
        let paramCount = 1;

        // Process profile photo
        if (profilePhotoFile) {
            const cloudResponse = await cloudinary.uploader.upload(profilePhotoFile.path);
            updates.push(`profile_photo = $${paramCount}`);
            values.push(cloudResponse.secure_url);
            paramCount++;
            fs.unlinkSync(profilePhotoFile.path); // Cleanup temp file
        }

        // Process resume
        if (resumeFile) {
            const cloudResponse = await cloudinary.uploader.upload(resumeFile.path, {
                resource_type: 'raw',
                format: path.extname(resumeFile.originalname).substring(1)
            });
            updates.push(`resume = $${paramCount}`);
            updates.push(`resume_original_name = $${paramCount + 1}`);
            values.push(cloudResponse.secure_url, resumeFile.originalname);
            paramCount += 2;
            fs.unlinkSync(resumeFile.path); // Cleanup temp file
        }

        // Handle text fields
        if (fullname) {
            updates.push(`fullname = $${paramCount}`);
            values.push(fullname);
            paramCount++;
        }

        if (email) {
            updates.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }

        if (phone_number) {
            updates.push(`phone_number = $${paramCount}`);
            values.push(phone_number);
            paramCount++;
        }

        if (bio) {
            updates.push(`bio = $${paramCount}`);
            values.push(bio);
            paramCount++;
        }

        if (skills) {
            updates.push(`skills = $${paramCount}`);
            values.push(skills.split(','));
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: "No fields to update",
                success: false
            });
        }

        const query = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        values.push(userId);

        const result = await pool.query(query, values);

        res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0],
            success: true
        });

    } catch (error) {
        console.error('Update error:', error);

        // Cleanup any uploaded files on error
        if (req.files?.['profile_photo']?.[0]) {
            fs.unlinkSync(req.files['profile_photo'][0].path);
        }
        if (req.files?.['resume']?.[0]) {
            fs.unlinkSync(req.files['resume'][0].path);
        }

        res.status(500).json({
            message: "Profile update failed",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// login and logout functions remain the same
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        console.log('Attempting login for email:', email);

        const result = await pool.query(
            'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        console.log('Query executed, rows found:', result.rows.length);

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }

        const user = result.rows[0];
        console.log('User found:', user.id);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }

        if (user.role.toLowerCase() !== role.toLowerCase()) {
            return res.status(403).json({
                message: "Invalid role access",
                success: false
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const userData = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            profile_photo: user.profile_photo,
            bio: user.bio,
            skills: user.skills,
            resume: user.resume,
            resume_original_name: user.resume_original_name
        };

        console.log('Login response:', userData);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 86400000
        });

        res.status(200).json({
            message: "Login successful",
            user: userData,
            token: token,
            success: true
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: "Server error",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        message: "Logged out successfully",
        success: true
    });
};
