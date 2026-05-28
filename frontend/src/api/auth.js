import axios from 'axios';

// CHANGED: Now uses VITE_API_URL instead of dynamic routing
const API_URL = import.meta.env.VITE_API_URL;

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