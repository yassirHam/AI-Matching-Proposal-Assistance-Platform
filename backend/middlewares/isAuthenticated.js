import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const isAuthenticated = async (req, res, next) => {
    try {
        // Check both Authorization header and cookies
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
                success: false
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists
        const userResult = await pool.query(
            'SELECT id, email FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid user",
                success: false
            });
        }

        // Attach user to request
        req.user = userResult.rows[0];
        next();
    } catch (error) {
        console.error("Authentication error:", error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired",
                success: false
            });
        }

        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        });
    }
};

export default isAuthenticated;