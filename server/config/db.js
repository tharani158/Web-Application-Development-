const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    const connect = async (uri) => {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    };

    if (mongoUri) {
      try {
        await connect(mongoUri);
        return;
      } catch (error) {
        if (process.env.NODE_ENV === 'production') {
          throw error;
        }
        console.warn('Could not connect to configured MongoDB. Falling back to in-memory MongoDB for development.');
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Using in-memory MongoDB for development');
      await connect(mongoUri);
      return;
    }

    throw new Error('MONGO_URI is not defined or MongoDB connection failed. Set a valid MongoDB URI and ensure the database is accessible.');
  } catch (error) {
    throw error;
  }
};

module.exports = connectDB;
