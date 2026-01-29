const prisma = require('../config/prisma');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify user is a student
    if (user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, error: 'This endpoint is only for students' });
    }

    // Get student's booking stats
    const bookings = await prisma.booking.findMany({
      where: { studentId: userId }
    });

    const stats = {
      total: bookings.length,
      upcoming: bookings.filter(b => b.status === 'UPCOMING').length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      pending: bookings.filter(b => b.status === 'PENDING').length
    };

    // Get student's reviews count
    const reviewsCount = await prisma.review.count({
      where: { studentId: userId }
    });

    res.json({
      success: true,
      profile: {
        ...user,
        stats,
        reviewsCount
      }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  getStudentProfile
};
