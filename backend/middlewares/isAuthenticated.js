import jwt from "jsonwebtoken";
import { query } from "../utils/db.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userResult = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid user",
                success: false
            });
        }

        req.id = decoded.userId;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        });
    }
};

export default isAuthenticated;