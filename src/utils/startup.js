const prisma = require('../config/prisma');
const seedAdmin = require('./seedAdmin');

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await prisma.user.count();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('\n Troubleshooting tips:');
    console.error('   1. Check if your Neon database is active (it may have auto-paused)');
    console.error('   2. Verify DATABASE_URL in your .env file is correct');
    console.error('   3. Ensure your database connection string is up to date');
    console.error('   4. Check your network connection\n');
    process.exit(1);
  }
};

// Initialize application (DB connection + seeding)
const initializeApp = async () => {
  await testDatabaseConnection();
  await seedAdmin();
};

module.exports = { initializeApp };
