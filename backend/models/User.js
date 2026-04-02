const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Only Gmail allowed"]
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "analyst", "viewer"],
        default: "viewer"
    }
});

module.exports = mongoose.model("User", userSchema);