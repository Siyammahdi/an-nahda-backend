// Simple script to test the authentication endpoints
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

// Test user registration
const testRegister = async () => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    console.log('Register Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Register Error:', error.response ? error.response.data : error.message);
  }
};

// Test user login
const testLogin = async () => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    console.log('Login Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
  }
};

// Test get current user
const testGetMe = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Get Me Response:', response.data);
  } catch (error) {
    console.error('Get Me Error:', error.response ? error.response.data : error.message);
  }
};

// Test logout
const testLogout = async () => {
  try {
    const response = await axios.get(`${API_URL}/logout`);
    console.log('Logout Response:', response.data);
  } catch (error) {
    console.error('Logout Error:', error.response ? error.response.data : error.message);
  }
};

// Run tests
const runTests = async () => {
  // Register a new user
  const registerData = await testRegister();
  
  if (registerData) {
    // Test authentication with token
    await testGetMe(registerData.token);
  } else {
    // Try login if registration fails (user might already exist)
    const loginData = await testLogin();
    
    if (loginData) {
      await testGetMe(loginData.token);
    }
  }
  
  // Test logout
  await testLogout();
};

runTests(); 