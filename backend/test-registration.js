const axios = require('axios');

const testData = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  phone: "1234567890",
  bloodGroup: "O+",
  age: 25,
  gender: "male",
  role: "donor",
  address: {
    street: "123 Test St",
    city: "Test City",
    state: "Test State",
    zipCode: "12345"
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