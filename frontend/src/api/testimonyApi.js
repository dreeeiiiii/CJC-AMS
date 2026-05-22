import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitTestimony = async (fullName, testimony) => {
  const res = await axios.post(`${API_URL}/api/testimonies`, {
    fullName,
    testimony,
  });
  return res.data;
};
