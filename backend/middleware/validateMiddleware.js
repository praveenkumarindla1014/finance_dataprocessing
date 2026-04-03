/**
 * Input validation middleware for all request types
 */

// Validate registration input
const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push("Name is required and must be at least 2 characters.");
    }

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        errors.push("A valid email address is required.");
    }

    if (!password || password.length < 6) {
        errors.push("Password is required and must be at least 6 characters.");
    }

    if (role && !["viewer", "analyst", "admin"].includes(role)) {
        errors.push("Role must be viewer, analyst, or admin.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

// Validate login input
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email) {
        errors.push("Email is required.");
    }

    if (!password) {
        errors.push("Password is required.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

// Validate record creation / update input
const validateRecord = (req, res, next) => {
    const { amount, type, category } = req.body;
    const errors = [];

    // For PUT requests, all fields are optional (partial update)
    const isUpdate = req.method === "PUT" || req.method === "PATCH";

    if (!isUpdate || amount !== undefined) {
        if (amount === undefined || amount === null) {
            errors.push("Amount is required.");
        } else if (typeof amount !== "number" || amount < 0) {
            errors.push("Amount must be a non-negative number.");
        }
    }

    if (!isUpdate || type !== undefined) {
        if (!isUpdate && !type) {
            errors.push("Type is required.");
        } else if (type && !["income", "expense"].includes(type)) {
            errors.push("Type must be income or expense.");
        }
    }

    if (!isUpdate || category !== undefined) {
        if (!isUpdate && !category) {
            errors.push("Category is required.");
        } else if (category && category.trim().length === 0) {
            errors.push("Category cannot be empty.");
        }
    }

    if (req.body.description && req.body.description.length > 500) {
        errors.push("Description cannot exceed 500 characters.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

// Validate MongoDB ObjectId parameter
const validateObjectId = (req, res, next) => {
    const { id } = req.params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format.",
        });
    }

    next();
};

// Validate user update input (admin managing users)
const validateUserUpdate = (req, res, next) => {
    const { role, status, name } = req.body;
    const errors = [];

    if (role && !["viewer", "analyst", "admin"].includes(role)) {
        errors.push("Role must be viewer, analyst, or admin.");
    }

    if (status && !["active", "inactive"].includes(status)) {
        errors.push("Status must be active or inactive.");
    }

    if (name !== undefined && name.trim().length < 2) {
        errors.push("Name must be at least 2 characters.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateRecord,
    validateObjectId,
    validateUserUpdate,
};
