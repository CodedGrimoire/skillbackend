const prisma = require('../config/prisma');


const createReview = async (req, res) => {
  try {
    const { tutorId, rating, comment } = req.body;
    const studentId = req.user.id || req.user.userId;

   
    if (!tutorId || !rating) {
      return res.status(400).json({ error: 'Tutor ID and rating are required' });
    }

   
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    
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

    
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

   
    if (studentId === tutorId) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

   
    const existingReview = await prisma.review.findFirst({
      where: {
        studentId,
        tutorId
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this tutor' });
    }

  
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

// Check if current student has reviewed a tutor
const checkStudentReview = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const studentId = req.user.id || req.user.userId;

    // Verify tutor exists
    const tutor = await prisma.user.findFirst({
      where: {
        id: tutorId,
        role: 'TUTOR'
      }
    });

    if (!tutor) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }

    // Check if student has reviewed this tutor
    const review = await prisma.review.findFirst({
      where: {
        studentId,
        tutorId
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      hasReviewed: !!review,
      review: review || null
    });
  } catch (error) {
    console.error('Check student review error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id || req.user.userId;
    const role = req.user.role;

    // Validation
    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5' });
    }

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        tutor: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Check permissions: only the student who created the review or admin can update
    if (role !== 'ADMIN' && review.studentId !== userId) {
      return res.status(403).json({ success: false, error: 'You can only update your own reviews' });
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment })
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

    // Recalculate tutor's average rating
    const allReviews = await prisma.review.findMany({
      where: { tutorId: review.tutorId },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    // Update tutor profile rating
    await prisma.tutorProfile.update({
      where: { userId: review.tutorId },
      data: { rating: Math.round(averageRating * 10) / 10 }
    });

    res.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;
    const role = req.user.role;

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        tutor: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Check permissions: only the student who created the review or admin can delete
    if (role !== 'ADMIN' && review.studentId !== userId) {
      return res.status(403).json({ success: false, error: 'You can only delete your own reviews' });
    }

    const tutorId = review.tutorId;

    // Delete review
    await prisma.review.delete({
      where: { id }
    });

    // Recalculate tutor's average rating (excluding deleted review)
    const allReviews = await prisma.review.findMany({
      where: { tutorId },
      select: { rating: true }
    });

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    // Update tutor profile rating
    await prisma.tutorProfile.update({
      where: { userId: tutorId },
      data: { rating: Math.round(averageRating * 10) / 10 }
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  createReview,
  getTutorReviews,
  checkStudentReview,
  updateReview,
  deleteReview
};
