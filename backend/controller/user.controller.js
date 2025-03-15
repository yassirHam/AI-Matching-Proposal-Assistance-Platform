import pool from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);
        const { fullname, email, phone_number, password, role }  = req.body;
        const file = req.file;
           if (!file) {
            return res.status(400).json({
                success: false,
                message: "Profile photo is required"
            });
        }

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

        let profilePhoto = null;
        if (file) {
            const cloudResponse = await cloudinary.uploader.upload(file.path);
            profilePhoto = cloudResponse.secure_url;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await pool.query(`
            INSERT INTO users (
                fullname, email, phone_number, password, role, profile_photo
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, fullname, email, phone_number, role, profile_photo
        `, [fullname, email, phone_number, hashedPassword, role, profilePhoto]);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0],
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        console.log('Attempting login for email:', email);

        // Case-insensitive email search
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

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }

        // Verify role exactly
        if (user.role.toLowerCase() !== role.toLowerCase()) {
            return res.status(403).json({
                message: "Invalid role access",
                success: false
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return response
        const userData = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            profile_photo: user.profile_photo
        };

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 86400000
        });

        res.status(200).json({
            message: "Login successful",
            user: userData,
            token: token, // Include token in response
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

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Use req.user.id from isAuthenticated middleware
        const { fullname, email, phone_number, bio, skills } = req.body;
        const file = req.file;

        let resumeUrl = null;
        let resumeName = null;
        if (file) {
            const cloudResponse = await cloudinary.uploader.upload(file.path);
            resumeUrl = cloudResponse.secure_url;
            resumeName = file.originalname;
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (fullname) {
            updateFields.push(`fullname = $${paramCount}`);
            values.push(fullname);
            paramCount++;
        }

        if (email) {
            updateFields.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }

        if (phone_number) {
            updateFields.push(`phone_number = $${paramCount}`);
            values.push(phone_number);
            paramCount++;
        }

        if (bio) {
            updateFields.push(`bio = $${paramCount}`);
            values.push(bio);
            paramCount++;
        }

        if (skills) {
            updateFields.push(`skills = $${paramCount}`);
            values.push(skills.split(','));
            paramCount++;
        }

        if (resumeUrl) {
            updateFields.push(`resume = $${paramCount}`);
            values.push(resumeUrl);
            paramCount++;
            updateFields.push(`resume_original_name = $${paramCount}`);
            values.push(resumeName);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                message: "No fields to update",
                success: false
            });
        }

        const query = `
            UPDATE users
            SET ${updateFields.join(', ')}
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
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};