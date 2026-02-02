const prisma = require('../config/prisma');


const createBooking = async (req, res) => 
  
  {
  try {
    const { tutorId, dateTime } = req.body;
    const studentId = req.user.id || req.user.userId;

    
    if (!tutorId || !dateTime) {
      return res.status(400).json({ success: false, error: 'Tutor ID and date/time are required' });
    }

   
    const tutor = await prisma.user.findFirst({
      where: {
        id: tutorId,
        role: 'TUTOR'
      }
    });

    if (!tutor) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }

  
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    
    if (studentId === tutorId) {
      return res.status(400).json({ success: false, error: 'Cannot book yourself' });
    }

   
    const booking = await prisma.booking.create({
      data: {
        studentId,
        tutorId,
        dateTime: new Date(dateTime),
        status: 'UPCOMING'
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

    res.status(201).json({ success: true, booking });
  } 
  
  
  
  catch (error) {
    console.error('Create booking error:', error);



    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get current user's bookings
const getMyBookings = async (req, res) => {
  try 
  
  
  
  {
    const userId = req.user.id || req.user.userId;

    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, error: 'Only students can view their bookings' });
    }

    const bookings = await prisma.booking.findMany({
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

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get bookings for current user (student or tutor, admin gets all)
const getBookings = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const role = req.user.role;

    let where = {};
    if (role === 'STUDENT') {
      where = { studentId: userId };
    } else if (role === 'TUTOR') {
      where = { tutorId: userId };
    } // ADMIN gets all

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            tutorProfile: {
              select: { bio: true, skills: true, hourlyRate: true, rating: true }
            }
          }
        }
      },
      orderBy: { dateTime: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id || req.user.userId;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            tutorProfile: {
              select: { bio: true, skills: true, hourlyRate: true, rating: true }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (
      role !== 'ADMIN' &&
      booking.studentId !== userId &&
      booking.tutorId !== userId
    ) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({ success: true, booking });
  } 
  
  
  
  catch (error) 
  
  
  
  {
   // console.error('Get booking by id error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const getTutorBookings = async (req, res) =>
  
  
  
  {
  try {
    const userId = req.user.id || req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role !== 'TUTOR') {
      return res.status(403).json({ success: false, error: 'Only tutors can view their bookings' });
    }

    const bookings = await prisma.booking.findMany({
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
      orderBy: { dateTime: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get tutor bookings error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, error: 'Only students can view booking stats' });
    }

    const now = new Date();

    const [upcoming, completed, cancelled] = await Promise.all([
      prisma.booking.count({
        where: {
          studentId: userId,
          status: { in: ['UPCOMING', 'PENDING', 'CONFIRMED'] },
          dateTime: { gte: now }
        }
      }),
      prisma.booking.count({
        where: {
          studentId: userId,
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          dateTime: { lt: now }
        }
      }),
      prisma.booking.count({
        where: {
          studentId: userId,
          status: 'CANCELLED'
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        upcoming,
        completed,
        cancelled
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.id || req.body.bookingId;
    const userId = req.user.id || req.user.userId;
    const role = req.user.role;

    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'Booking ID is required' });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { id: true, name: true } },
        tutor: { select: { id: true, name: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

   
    if (
      role !== 'ADMIN' &&
      booking.studentId !== userId &&
      booking.tutorId !== userId
    ) {
      return res.status(403).json({ success: false, error: 'You can only complete your own bookings' });
    }

   
    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: 'Booking is already completed' });
    }

    // Check if booking is cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Cannot complete a cancelled booking' });
    }

    // Update booking status to COMPLETED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutor: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({ success: true, booking: updatedBooking });
  } 
  
  
  
  catch (error) 
  
  
  {
    console.error('Complete booking error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookings,
  getBookingById,
  getTutorBookings,
  getBookingStats,
  completeBooking
};
