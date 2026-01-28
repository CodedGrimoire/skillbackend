const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth.routes');
const tutorRoutes = require('../routes/tutor.routes');
const bookingRoutes = require('../routes/booking.routes');
const reviewRoutes = require('../routes/review.routes');
const adminRoutes = require('../routes/admin.routes');
const { errorHandler, notFoundHandler } = require('../middlewares/error.middleware');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'SkillBridge backend running ✅' 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
