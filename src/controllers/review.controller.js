const prisma = require('../config/prisma');

// Create a review (student reviews tutor)
const createReview = async (req, res) => {
  try {
    const { tutorId, rating, comment } = req.body;
    const studentId = req.user.userId;

    // Validation
    if (!tutorId || !rating) {
      return res.status(400).json({ error: 'Tutor ID and rating are required' });
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // Verify tutor exists and is actually a tutor
    const tutor = await prisma.user.findFirst({
      where: {
        id: tutorId,
        role: 'TUTOR'
      },
      include: {
        tutorProfile: true
      }
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Prevent reviewing yourself
    if (studentId === tutorId) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    // Check if student already reviewed this tutor
    const existingReview = await prisma.review.findFirst({
      where: {
        studentId,
        tutorId
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this tutor' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        studentId,
        tutorId,
        rating,
        comment: comment || null
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate and update tutor's average rating
    const allReviews = await prisma.review.findMany({
      where: { tutorId },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    // Update tutor profile rating
    if (tutor.tutorProfile) {
      await prisma.tutorProfile.update({
        where: { userId: tutorId },
        data: { rating: averageRating }
      });
    } else {
      // Create tutor profile if it doesn't exist
      await prisma.tutorProfile.create({
        data: {
          userId: tutorId,
          rating: averageRating
        }
      });
    }

    res.status(201).json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get reviews for a tutor
const getTutorReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify tutor exists
    const tutor = await prisma.user.findFirst({
      where: {
        id,
        role: 'TUTOR'
      }
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Get all reviews for this tutor
    const reviews = await prisma.review.findMany({
      where: { tutorId: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Get tutor reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createReview,
  getTutorReviews
};
