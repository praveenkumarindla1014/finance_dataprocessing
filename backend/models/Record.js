const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        type: {
            type: String,
            enum: {
                values: ["income", "expense"],
                message: "Type must be income or expense",
            },
            required: [true, "Type is required"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for common queries
recordSchema.index({ type: 1, category: 1, date: -1 });
recordSchema.index({ createdBy: 1 });
recordSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Record", recordSchema);