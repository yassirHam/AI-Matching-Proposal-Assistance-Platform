import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Authentication required",
                success: false
            });
        }

        const token = authHeader.split(' ')[1]; // Extract token

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user exists in the database
        const userResult = await pool.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid user",
                success: false
            });
        }

        // Attach user information to the request object
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