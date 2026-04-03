const User = require("../models/User");

// ─── GET ALL USERS (Admin only) ──────────────────────────────────────
exports.getAllUsers = async (req, res) => {
    try {
        const {
            role,
            status,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const filter = {};

        if (role) filter.role = role;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalUsers: total,
                    limit: limitNum,
                },
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
            error: err.message,
        });
    }
};

// ─── GET SINGLE USER (Admin only) ───────────────────────────────────
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

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
            message: "Failed to fetch user.",
            error: err.message,
        });
    }
};

// ─── UPDATE USER (Admin only — change role/status) ───────────────────
exports.updateUser = async (req, res) => {
    try {
        const { name, role, status } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Prevent admin from demoting themselves
        if (req.user.id.toString() === req.params.id && role && role !== "admin") {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own role.",
            });
        }

        // Prevent admin from deactivating themselves
        if (req.user.id.toString() === req.params.id && status === "inactive") {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account.",
            });
        }

        if (name !== undefined) user.name = name;
        if (role !== undefined) user.role = role;
        if (status !== undefined) user.status = status;

        await user.save();

        res.json({
            success: true,
            message: "User updated successfully.",
            data: { user },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update user.",
            error: err.message,
        });
    }
};

// ─── DELETE USER (Admin only) ────────────────────────────────────────
exports.deleteUser = async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.user.id.toString() === req.params.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account.",
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user.",
            error: err.message,
        });
    }
};
