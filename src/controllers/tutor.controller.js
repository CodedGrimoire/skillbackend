const prisma = require('../config/prisma');

// Get all tutors
const getTutors = async (req, res) => {
  try {
    const tutors = await prisma.user.findMany({
      where: {
        role: 'TUTOR'
      },
      include: {
        tutorProfile: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        tutorProfile: {
          select: {
            id: true,
            bio: true,
            skills: true,
            hourlyRate: true,
            availability: true,
            rating: true
          }
        }
      }
    });

    res.json({ tutors });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single tutor by ID
const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;

    const tutor = await prisma.user.findFirst({
      where: {
        id,
        role: 'TUTOR'
      },
      include: {
        tutorProfile: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        tutorProfile: {
          select: {
            id: true,
            bio: true,
            skills: true,
            hourlyRate: true,
            availability: true,
            rating: true
          }
        }
      }
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ tutor });
  } catch (error) {
    console.error('Get tutor by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTutors,
  getTutorById
};
