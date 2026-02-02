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


module.exports = router;
