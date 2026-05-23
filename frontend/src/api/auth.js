import axios from 'axios';

// 🚀 DYNAMIC ROUTING: Switches automatically depending on what device you use!
const getBackendUrl = () => {
  const hostname = window.location.hostname; // Reads the browser address bar
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000'; // For your laptop
  }
  
  return 'http://192.168.68.104:5000'; // For your mobile phone
};

const API_URL = getBackendUrl();

export const registerUser = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Server error' };
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Server error' };
  }
};