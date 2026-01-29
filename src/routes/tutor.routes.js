const express = require('express');
const router = express.Router();
const { getTutors, getTutorById, getTutorProfile, getTutorAvailability, updateTutorProfile, updateTutorAvailability } = require('../controllers/tutor.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/', getTutors);
// Specific routes must come before parameterized routes
router.get('/profile', authenticate, authorizeRoles('TUTOR'), getTutorProfile);
router.put('/profile', authenticate, authorizeRoles('TUTOR'), updateTutorProfile);
router.get('/availability', authenticate, authorizeRoles('TUTOR'), getTutorAvailability);
router.put('/availability', authenticate, authorizeRoles('TUTOR'), updateTutorAvailability);
router.get('/:id', getTutorById);

/**
 * curl -X PUT -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
 *   -d '{"bio":"New bio","skills":"JS,React","hourlyRate":75}' http://localhost:5001/api/tutor/profile
 *
 * curl -X PUT -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
 *   -d '{"availability":"Mon-Fri 9-5"}' http://localhost:5001/api/tutor/availability
 */

module.exports = router;
