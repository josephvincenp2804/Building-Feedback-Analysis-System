/**
 * Role-based access control middleware.
 * Usage: router.get('/admin-route', protect, requireRole('admin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { requireRole };
