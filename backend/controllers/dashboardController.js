const Record = require("../models/Record");

// ─── GET SUMMARY (Total Income, Expenses, Net Balance) ───────────────
exports.getSummary = async (req, res) => {
    try {
        const summary = await Record.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                        },
                    },
                    totalExpenses: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                        },
                    },
                    totalRecords: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalIncome: 1,
                    totalExpenses: 1,
                    netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
                    totalRecords: 1,
                },
            },
        ]);

        res.json({
            success: true,
            data: summary[0] || {
                totalIncome: 0,
                totalExpenses: 0,
                netBalance: 0,
                totalRecords: 0,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch summary.",
            error: err.message,
        });
    }
};

// ─── GET CATEGORY-WISE TOTALS ────────────────────────────────────────
exports.getCategoryTotals = async (req, res) => {
    try {
        const { type } = req.query; // optional filter by income/expense

        const matchStage = { isDeleted: false };
        if (type && ["income", "expense"].includes(type)) {
            matchStage.type = type;
        }

        const categoryTotals = await Record.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { category: "$category", type: "$type" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id.category",
                    type: "$_id.type",
                    total: 1,
                    count: 1,
                },
            },
            { $sort: { total: -1 } },
        ]);

        res.json({
            success: true,
            data: { categoryTotals },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch category totals.",
            error: err.message,
        });
    }
};

// ─── GET MONTHLY TRENDS ─────────────────────────────────────────────
exports.getMonthlyTrends = async (req, res) => {
    try {
        const { year } = req.query;

        const matchStage = { isDeleted: false };
        if (year) {
            matchStage.date = {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`),
            };
        }

        const monthlyTrends = await Record.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        type: "$type",
                    },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: { year: "$_id.year", month: "$_id.month" },
                    breakdown: {
                        $push: {
                            type: "$_id.type",
                            total: "$total",
                            count: "$count",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    breakdown: 1,
                },
            },
            { $sort: { year: 1, month: 1 } },
        ]);

        res.json({
            success: true,
            data: { monthlyTrends },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch monthly trends.",
            error: err.message,
        });
    }
};

// ─── GET RECENT TRANSACTIONS ─────────────────────────────────────────
exports.getRecentTransactions = async (req, res) => {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

        const transactions = await Record.find({ isDeleted: false })
            .populate("createdBy", "name email")
            .sort({ date: -1, createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: { transactions, count: transactions.length },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent transactions.",
            error: err.message,
        });
    }
};

// ─── GET INCOME VS EXPENSE COMPARISON ────────────────────────────────
exports.getIncomeVsExpense = async (req, res) => {
    try {
        const comparison = await Record.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                    avgAmount: { $avg: "$amount" },
                    maxAmount: { $max: "$amount" },
                    minAmount: { $min: "$amount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    total: 1,
                    count: 1,
                    avgAmount: { $round: ["$avgAmount", 2] },
                    maxAmount: 1,
                    minAmount: 1,
                },
            },
        ]);

        res.json({
            success: true,
            data: { comparison },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch comparison data.",
            error: err.message,
        });
    }
};
