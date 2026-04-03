/**
 * Role-based access control middleware
 *
 * Usage: authorize("admin", "analyst")
 * This will allow only users with admin or analyst roles to access the route.
 *
 * Role Hierarchy:
 *   - viewer:  Read-only access (can view all records)
 *   - analyst: Can view records, access analytics, create/update records
 *   - admin:   Full access (CRUD records + manage users)
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}.`,
            });
        }

        next();
    };
};

module.exports = authorize;