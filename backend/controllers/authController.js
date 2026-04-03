const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// ─── REGISTER ────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "A user with this email already exists.",
            });
        }

        // Create user (password is hashed via pre-save hook in model)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role || "viewer",
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
                token,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Registration failed.",
            error: err.message,
        });
    }
};

// ─── LOGIN ───────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Check if account is active
        if (user.status === "inactive") {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Contact admin.",
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: "Login successful.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
                token,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Login failed.",
            error: err.message,
        });
    }
};

// ─── GET CURRENT USER PROFILE ────────────────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            data: { user },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
            error: err.message,
        });
    }
};