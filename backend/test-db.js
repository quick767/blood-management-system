const mongoose = require('mongoose');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

console.log('Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI Found' : 'URI Missing');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-management')
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database Name:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
  
  // Test creating a simple document
  const testSchema = new mongoose.Schema({
    test: String,
    timestamp: { type: Date, default: Date.now }
  });
  
  const TestModel = mongoose.model('Test', testSchema);
  
  return TestModel.create({ test: 'Database connection test' });
})
.then((doc) => {
  console.log('✅ Test document created:', doc._id);
  return mongoose.connection.close();
})
.then(() => {
  console.log('✅ Connection closed successfully');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});