const axios = require('axios');

const testData = {
  name: "Test User 2",
  email: "test2@example.com",
  password: "password123",
  phone: "9876543210",
  bloodGroup: "A+",
  age: 30,
  gender: "female",
  role: "recipient",
  address: {
    street: "456 Test Ave",
    city: "Test City 2",
    state: "Test State 2",
    zipCode: "54321"
  }
};

console.log('Testing Registration API...');
console.log('API URL: https://blood-management-api.onrender.com/api/auth/register');

axios.post('https://blood-management-api.onrender.com/api/auth/register', testData)
.then(response => {
  console.log('✅ Registration Success!');
  console.log('Status:', response.status);
  console.log('Response:', response.data);
})
.catch(error => {
  console.error('❌ Registration Failed!');
  console.error('Status:', error.response?.status);
  console.error('Error:', error.response?.data || error.message);
  console.error('Full Error:', error.code);
});