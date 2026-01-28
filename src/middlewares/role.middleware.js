// Simple role-based guard. Usage: authorizeRoles('ADMIN', 'TUTOR')
const authorizeRoles = (...allowed) => (req, res, next) => {
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
};

module.exports = { authorizeRoles };
