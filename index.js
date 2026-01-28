require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/config/prisma');
const authRoutes = require('./src/routes/auth.routes');
const tutorRoutes = require('./src/routes/tutor.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const reviewRoutes = require('./src/routes/review.routes');
const seedAdmin = require('./src/utils/seedAdmin');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SkillBridge backend running ✅' });
});

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.user.count();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check if your Neon database is active (it may have auto-paused)');
    console.error('   2. Verify DATABASE_URL in your .env file is correct');
    console.error('   3. Ensure your database connection string is up to date');
    console.error('   4. Check your network connection\n');
    process.exit(1);
  }
}

// Server
const PORT = process.env.PORT || 3000;

// Start server after DB connection test and admin seeding
testDatabaseConnection().then(async () => {
  // Seed admin user if it doesn't exist
  await seedAdmin();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please free the port or use a different one.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
});
