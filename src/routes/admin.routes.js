const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/stats', authenticate, authorizeRoles('ADMIN'), getAdminStats);

/**
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/stats
 */

module.exports = router;
