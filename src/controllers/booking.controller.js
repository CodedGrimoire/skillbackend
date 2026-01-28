const prisma = require('../config/prisma');

// Create a new booking (student books tutor)
const createBooking = async (req, res) => {
  try {
    const { tutorId, dateTime } = req.body;
    const studentId = req.user.userId;

    // Validation
    if (!tutorId || !dateTime) {
      return res.status(400).json({ error: 'Tutor ID and date/time are required' });
    }

    // Verify tutor exists and is actually a tutor
    const tutor = await prisma.user.findFirst({
      where: {
        id: tutorId,
        role: 'TUTOR'
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

    // Prevent booking yourself
    if (studentId === tutorId) {
      return res.status(400).json({ error: 'Cannot book yourself' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        studentId,
        tutorId,
        dateTime: new Date(dateTime),
        status: 'PENDING'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user's bookings
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get bookings based on user role
    let bookings;
    if (user.role === 'STUDENT') {
      // Get bookings where user is the student
      bookings = await prisma.booking.findMany({
        where: { studentId: userId },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              email: true,
              tutorProfile: {
                select: {
                  bio: true,
                  skills: true,
                  hourlyRate: true,
                  rating: true
                }
              }
            }
          }
        },
        orderBy: {
          dateTime: 'desc'
        }
      });
    } else if (user.role === 'TUTOR') {
      // Get bookings where user is the tutor
      bookings = await prisma.booking.findMany({
        where: { tutorId: userId },
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
          dateTime: 'desc'
        }
      });
    } else {
      // ADMIN can see all bookings
      bookings = await prisma.booking.findMany({
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tutor: {
            select: {
              id: true,
              name: true,
              email: true,
              tutorProfile: {
                select: {
                  bio: true,
                  skills: true,
                  hourlyRate: true,
                  rating: true
                }
              }
            }
          }
        },
        orderBy: {
          dateTime: 'desc'
        }
      });
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings
};
