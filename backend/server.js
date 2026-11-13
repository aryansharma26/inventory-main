import 'dotenv/config';
import connectDB from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
