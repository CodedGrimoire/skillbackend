require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/config/prisma');
const authRoutes = require('./src/routes/auth.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

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
    process.exit(1);
  }
}

// Server
const PORT = process.env.PORT || 3000;

// Start server after DB connection test
testDatabaseConnection().then(() => {
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
