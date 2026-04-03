const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedDemoUsers = async () => {
    try {
        const demoUsers = [
            { name: "Demo Admin", email: "admin@findash.com", password: "admin123", role: "admin" },
            { name: "Demo Analyst", email: "analyst@findash.com", password: "analyst123", role: "analyst" },
            { name: "Demo Viewer", email: "viewer@findash.com", password: "viewer123", role: "viewer" }
        ];

        for (const user of demoUsers) {
            const exists = await User.findOne({ email: user.email });
            if (!exists) {
                // We must hash the password before saving
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                await User.create({
                    name: user.name,
                    email: user.email,
                    password: hashedPassword,
                    role: user.role,
                    status: "active"
                });
                console.log(`✅ Seeded demo user: ${user.email}`);
            }
        }
    } catch (error) {
        console.error("❌ Failed to seed demo users:", error.message);
    }
};

module.exports = seedDemoUsers;
