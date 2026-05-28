import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const submitTestimony = async (fullName, testimony) => {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await axios.post(`${API_URL}/api/testimonies`, {
    fullName,
    testimony,
  }, { headers });
  return res.data;
};