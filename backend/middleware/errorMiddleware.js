/**
 * Global error handling middleware
 */

// 404 handler — for routes that don't exist
const notFound = (req, res, next) => {
    const error = new Error(`Not Found — ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId (CastError)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Resource not found. Invalid ID.";
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field: ${field}. Please use a different value.`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };
