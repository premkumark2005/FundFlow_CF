const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Add retry logic for connection
    let retries = 3;
    while (retries > 0) {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
          socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Add connection error handler
        mongoose.connection.on('error', err => {
          console.error('MongoDB connection error:', err);
        });

        // Add disconnection handler
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected. Trying to reconnect...');
        });

        // Add successful reconnection handler
        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected');
        });

        return true;
      } catch (error) {
        retries -= 1;
        if (retries === 0) throw error;
        console.log(`MongoDB connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Please make sure MongoDB is running on mongodb://localhost:27017');
    process.exit(1);
  }
};

module.exports = connectDB;
