const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        // Check for token in Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists and is active
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User belonging to this token no longer exists.",
            });
        }

        if (user.status === "inactive") {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Contact admin.",
            });
        }

        // Attach user info to request
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Authentication error.",
        });
    }
};

module.exports = authMiddleware;