const Record = require("../models/Record");

// ─── CREATE RECORD ───────────────────────────────────────────────────
exports.createRecord = async (req, res) => {
    try {
        const { amount, type, category, date, description } = req.body;

        const record = await Record.create({
            amount,
            type,
            category,
            date: date || Date.now(),
            description,
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Record created successfully.",
            data: { record },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to create record.",
            error: err.message,
        });
    }
};

// ─── GET ALL RECORDS (with filtering, search, pagination) ────────────
exports.getRecords = async (req, res) => {
    try {
        const {
            type,
            category,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 10,
            sortBy = "date",
            sortOrder = "desc",
        } = req.query;

        // Build filter query
        const filter = { isDeleted: false };

        if (type) {
            filter.type = type;
        }

        if (category) {
            filter.category = { $regex: category, $options: "i" };
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        if (search) {
            filter.$or = [
                { category: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Sort
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Execute query
        const [records, total] = await Promise.all([
            Record.find(filter)
                .populate("createdBy", "name email")
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            Record.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: {
                records,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalRecords: total,
                    limit: limitNum,
                    hasNextPage: pageNum < Math.ceil(total / limitNum),
                    hasPrevPage: pageNum > 1,
                },
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch records.",
            error: err.message,
        });
    }
};

// ─── GET SINGLE RECORD ──────────────────────────────────────────────
exports.getRecord = async (req, res) => {
    try {
        const record = await Record.findOne({
            _id: req.params.id,
            isDeleted: false,
        }).populate("createdBy", "name email");

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Record not found.",
            });
        }

        res.json({
            success: true,
            data: { record },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch record.",
            error: err.message,
        });
    }
};

// ─── UPDATE RECORD ───────────────────────────────────────────────────
exports.updateRecord = async (req, res) => {
    try {
        const { amount, type, category, date, description } = req.body;

        const record = await Record.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Record not found.",
            });
        }

        // Update only provided fields
        if (amount !== undefined) record.amount = amount;
        if (type !== undefined) record.type = type;
        if (category !== undefined) record.category = category;
        if (date !== undefined) record.date = date;
        if (description !== undefined) record.description = description;

        await record.save();

        res.json({
            success: true,
            message: "Record updated successfully.",
            data: { record },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update record.",
            error: err.message,
        });
    }
};

// ─── DELETE RECORD (Soft Delete) ─────────────────────────────────────
exports.deleteRecord = async (req, res) => {
    try {
        const record = await Record.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Record not found.",
            });
        }

        // Soft delete
        record.isDeleted = true;
        record.deletedAt = new Date();
        await record.save();

        res.json({
            success: true,
            message: "Record deleted successfully.",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete record.",
            error: err.message,
        });
    }
};

// ─── RESTORE RECORD (Undo Soft Delete) ──────────────────────────────
exports.restoreRecord = async (req, res) => {
    try {
        const record = await Record.findOne({
            _id: req.params.id,
            isDeleted: true,
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Deleted record not found.",
            });
        }

        record.isDeleted = false;
        record.deletedAt = null;
        await record.save();

        res.json({
            success: true,
            message: "Record restored successfully.",
            data: { record },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to restore record.",
            error: err.message,
        });
    }
};