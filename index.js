require('dotenv').config();
const app = require('./src/config/server');
const { initializeApp } = require('./src/utils/startup');

const PORT = process.env.PORT || 3000;

// Initialize app (DB connection + seeding)
initializeApp().then(() => {
  // Start server
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
