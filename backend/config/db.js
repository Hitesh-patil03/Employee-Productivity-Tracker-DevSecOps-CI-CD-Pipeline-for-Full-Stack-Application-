const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('\n❌  MONGODB_URI is not set!');
    console.error('   Create a file at backend/.env with:');
    console.error('   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/produx\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
