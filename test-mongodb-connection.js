// Test MongoDB Connection
const mongoose = require('./backend/node_modules/mongoose');
require('dotenv').config({ path: './backend/.env.production' });

console.log('Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI Found' : 'URI Missing');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('✅ Database connection is working');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection failed:');
  console.error(err.message);
  process.exit(1);
});

// Timeout after 35 seconds
setTimeout(() => {
  console.error('❌ Connection test timed out after 35 seconds');
  process.exit(1);
}, 35000);