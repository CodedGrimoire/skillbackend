const prisma = require('../config/prisma');

// Get all tutors (with optional filters)
const getTutors = async (req, res) => {
  try {
    const { search, minRate, maxRate, minRating } = req.query;

    const where = {
      role: 'TUTOR',
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { tutorProfile: { skills: { contains: search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    // Nested filters for tutorProfile numbers
    const profileFilter = {
      ...(minRate ? { hourlyRate: { gte: parseFloat(minRate) } } : {}),
      ...(maxRate ? { hourlyRate: { lte: parseFloat(maxRate) } } : {}),
      ...(minRating ? { rating: { gte: parseFloat(minRating) } } : {})
    };

    const tutors = await prisma.user.findMany({
      where,
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
          },
          where: Object.keys(profileFilter).length ? profileFilter : undefined
        }
      }
    });

    res.json({ success: true, tutors });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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

// Update tutor profile (bio, skills, hourlyRate)
const updateTutorProfile = async (req, res) => {
  try {
    const tutorId = req.user.id || req.user.userId;
    const { bio, skills, hourlyRate } = req.body;

    // Basic validation
    if (hourlyRate !== undefined && isNaN(Number(hourlyRate))) {
      return res.status(400).json({ success: false, error: 'hourlyRate must be a number' });
    }

    // Ensure tutor exists
    const tutor = await prisma.user.findUnique({ where: { id: tutorId, role: 'TUTOR' } });
    if (!tutor) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }

    const profile = await prisma.tutorProfile.upsert({
      where: { userId: tutorId },
      update: {
        bio: bio ?? undefined,
        skills: skills ?? undefined,
        hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : undefined
      },
      create: {
        userId: tutorId,
        bio: bio ?? null,
        skills: skills ?? null,
        hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : 0
      }
    });

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Update tutor profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get current tutor's profile
const getTutorProfile = async (req, res) => {
  try {
    const tutorId = req.user.id || req.user.userId;

    // Get tutor with profile
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId, role: 'TUTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        tutorProfile: {
          select: {
            id: true,
            bio: true,
            skills: true,
            hourlyRate: true,
            availability: true,
            rating: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!tutor) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }

    res.json({ success: true, profile: tutor.tutorProfile || null, user: tutor });
  } catch (error) {
    console.error('Get tutor profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Update tutor availability string
const updateTutorAvailability = async (req, res) => {
  try {
    const tutorId = req.user.id || req.user.userId;
    const { availability } = req.body;

    if (availability === undefined || availability === null || availability === '') {
      return res.status(400).json({ success: false, error: 'availability is required' });
    }

    // Ensure tutor exists
    const tutor = await prisma.user.findUnique({ where: { id: tutorId, role: 'TUTOR' } });
    if (!tutor) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }

    const profile = await prisma.tutorProfile.upsert({
      where: { userId: tutorId },
      update: { availability },
      create: { userId: tutorId, availability }
    });

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Update tutor availability error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  getTutors,
  getTutorById,
  getTutorProfile,
  updateTutorProfile,
  updateTutorAvailability
};
