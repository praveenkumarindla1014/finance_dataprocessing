/**
 * API Test Script — Tests all endpoints sequentially
 * Run: node test-api.js
 */
const http = require("http");

const BASE = "http://localhost:5000";
let adminToken = "";
let analystToken = "";
let viewerToken = "";
let recordId = "";

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const data = body ? JSON.stringify(body) : null;
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (data) headers["Content-Length"] = Buffer.byteLength(data);

        const req = http.request(
            { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers },
            (res) => {
                let body = "";
                res.on("data", (c) => (body += c));
                res.on("end", () => {
                    try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
                    catch { resolve({ status: res.statusCode, body }); }
                });
            }
        );
        req.on("error", reject);
        if (data) req.write(data);
        req.end();
    });
}

function log(label, res) {
    const icon = res.status < 300 ? "✅" : res.status < 400 ? "⚠️" : "❌";
    console.log(`${icon} [${res.status}] ${label}`);
    if (res.status >= 400) console.log("   ", JSON.stringify(res.body));
}

async function runTests() {
    console.log("\n═══════════════════════════════════════════");
    console.log("  FINANCE API — FULL TEST SUITE");
    console.log("═══════════════════════════════════════════\n");

    // 1. Health check
    let r = await request("GET", "/");
    log("Health Check", r);

    // 2. Register Admin
    r = await request("POST", "/api/auth/register", { name: "Admin User", email: "admin@test.com", password: "admin123", role: "admin" });
    log("Register Admin", r);
    if (r.body.data) adminToken = r.body.data.token;

    // 3. Register Analyst
    r = await request("POST", "/api/auth/register", { name: "Analyst User", email: "analyst@test.com", password: "analyst123", role: "analyst" });
    log("Register Analyst", r);
    if (r.body.data) analystToken = r.body.data.token;

    // 4. Register Viewer
    r = await request("POST", "/api/auth/register", { name: "Viewer User", email: "viewer@test.com", password: "viewer123", role: "viewer" });
    log("Register Viewer", r);
    if (r.body.data) viewerToken = r.body.data.token;

    // 5. Login Admin
    r = await request("POST", "/api/auth/login", { email: "admin@test.com", password: "admin123" });
    log("Login Admin", r);
    if (r.body.data) adminToken = r.body.data.token;

    // 6. Get Profile
    r = await request("GET", "/api/auth/profile", null, adminToken);
    log("Get Admin Profile", r);

    console.log("\n--- Record CRUD Tests ---");

    // 7. Create record as Admin
    r = await request("POST", "/api/records", { amount: 5000, type: "income", category: "Salary", description: "Monthly salary" }, adminToken);
    log("Create Record (Admin)", r);
    if (r.body.data) recordId = r.body.data.record._id;

    // 8. Create record as Analyst
    r = await request("POST", "/api/records", { amount: 200, type: "expense", category: "Food", description: "Groceries" }, analystToken);
    log("Create Record (Analyst)", r);

    // 9. Create record as Viewer — should FAIL
    r = await request("POST", "/api/records", { amount: 100, type: "expense", category: "Test" }, viewerToken);
    log("Create Record (Viewer) → should 403", r);

    // 10. Get all records
    r = await request("GET", "/api/records", null, viewerToken);
    log("Get All Records (Viewer)", r);

    // 11. Get single record
    if (recordId) {
        r = await request("GET", `/api/records/${recordId}`, null, viewerToken);
        log("Get Single Record", r);
    }

    // 12. Update record as Analyst
    if (recordId) {
        r = await request("PUT", `/api/records/${recordId}`, { amount: 5500 }, analystToken);
        log("Update Record (Analyst)", r);
    }

    // 13. Update record as Viewer — should FAIL
    if (recordId) {
        r = await request("PUT", `/api/records/${recordId}`, { amount: 999 }, viewerToken);
        log("Update Record (Viewer) → should 403", r);
    }

    // 14. Delete record as Analyst — should FAIL
    if (recordId) {
        r = await request("DELETE", `/api/records/${recordId}`, null, analystToken);
        log("Delete Record (Analyst) → should 403", r);
    }

    // 15. Create more records for dashboard
    await request("POST", "/api/records", { amount: 3000, type: "income", category: "Freelance", date: "2026-03-15", description: "Project payment" }, adminToken);
    await request("POST", "/api/records", { amount: 500, type: "expense", category: "Transport", date: "2026-03-10", description: "Monthly pass" }, adminToken);
    await request("POST", "/api/records", { amount: 1500, type: "expense", category: "Rent", date: "2026-02-01", description: "Feb rent" }, adminToken);

    console.log("\n--- Dashboard Tests ---");

    // 16. Summary
    r = await request("GET", "/api/dashboard/summary", null, analystToken);
    log("Dashboard Summary (Analyst)", r);
    if (r.body.data) console.log("   ", JSON.stringify(r.body.data));

    // 17. Category totals
    r = await request("GET", "/api/dashboard/categories", null, adminToken);
    log("Category Totals", r);

    // 18. Monthly trends
    r = await request("GET", "/api/dashboard/monthly-trends?year=2026", null, adminToken);
    log("Monthly Trends", r);

    // 19. Recent transactions
    r = await request("GET", "/api/dashboard/recent?limit=3", null, viewerToken);
    log("Recent Transactions (Viewer)", r);

    // 20. Dashboard as Viewer — should FAIL
    r = await request("GET", "/api/dashboard/summary", null, viewerToken);
    log("Dashboard Summary (Viewer) → should 403", r);

    // 21. Income vs Expense comparison
    r = await request("GET", "/api/dashboard/comparison", null, analystToken);
    log("Income vs Expense (Analyst)", r);

    console.log("\n--- Filtering Tests ---");

    // 22. Filter by type
    r = await request("GET", "/api/records?type=income", null, adminToken);
    log(`Filter by type=income → ${r.body.data ? r.body.data.pagination.totalRecords : 0} records`, r);

    // 23. Filter by date range
    r = await request("GET", "/api/records?startDate=2026-03-01&endDate=2026-03-31", null, adminToken);
    log(`Filter by date range → ${r.body.data ? r.body.data.pagination.totalRecords : 0} records`, r);

    // 24. Search
    r = await request("GET", "/api/records?search=salary", null, adminToken);
    log(`Search 'salary' → ${r.body.data ? r.body.data.pagination.totalRecords : 0} records`, r);

    console.log("\n--- User Management (Admin only) ---");

    // 25. Get all users
    r = await request("GET", "/api/users", null, adminToken);
    log("Get All Users (Admin)", r);

    // 26. Get users as Analyst — should FAIL
    r = await request("GET", "/api/users", null, analystToken);
    log("Get Users (Analyst) → should 403", r);

    // 27. Validation test — bad input
    r = await request("POST", "/api/auth/register", { email: "bad", password: "12" });
    log("Validation: bad register → should 400", r);

    // 28. Auth test — no token
    r = await request("GET", "/api/records");
    log("No token → should 401", r);

    // 29. Delete record as Admin (soft delete)
    if (recordId) {
        r = await request("DELETE", `/api/records/${recordId}`, null, adminToken);
        log("Delete Record (Admin - soft)", r);
    }

    // 30. Restore record as Admin
    if (recordId) {
        r = await request("PATCH", `/api/records/${recordId}/restore`, null, adminToken);
        log("Restore Record (Admin)", r);
    }

    console.log("\n═══════════════════════════════════════════");
    console.log("  TEST SUITE COMPLETE");
    console.log("═══════════════════════════════════════════\n");

    process.exit(0);
}

runTests().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
