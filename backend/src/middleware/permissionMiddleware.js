// backend/src/middleware/permissionMiddleware.js
export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized"));
  }

  // Admins bypass permission checks
  if (req.user.role === "admin") {
    return next();
  }

  if (!req.user[permission]) {
    res.status(403);
    return next(new Error("You don't have permission for this action"));
  }

  next();
};
