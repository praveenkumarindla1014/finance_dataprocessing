const express = require("express");
const router = express.Router();
const {
    getSummary,
    getCategoryTotals,
    getMonthlyTrends,
    getRecentTransactions,
    getIncomeVsExpense,
} = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// All dashboard routes require authentication
router.use(authMiddleware);

// Summary — Analyst and Admin
router.get("/summary", authorize("analyst", "admin"), getSummary);

// Category-wise totals — Analyst and Admin
router.get("/categories", authorize("analyst", "admin"), getCategoryTotals);

// Monthly trends — Analyst and Admin
router.get("/monthly-trends", authorize("analyst", "admin"), getMonthlyTrends);

// Recent transactions — All roles can view
router.get("/recent", authorize("viewer", "analyst", "admin"), getRecentTransactions);

// Income vs Expense comparison — Analyst and Admin
router.get("/comparison", authorize("analyst", "admin"), getIncomeVsExpense);

module.exports = router;
