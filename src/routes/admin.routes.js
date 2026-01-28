const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminUsers } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/stats', authenticate, authorizeRoles('ADMIN'), getAdminStats);
router.get('/users', authenticate, authorizeRoles('ADMIN'), getAdminUsers);

/**
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/stats
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/users
 */

module.exports = router;
