const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Encode special characters in the MongoDB URI
    const encodedUri = process.env.MONGO_URI.replace(
      /[#@]/g,
      char => encodeURIComponent(char)
    );

    await mongoose.connect(encodedUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit the process, let the retry logic handle it
    throw error;
  }
};

module.exports = connectDB;
