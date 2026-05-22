import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchMyProfile = async () => {
  const res = await axios.get(`${API_URL}/api/users/me`, authHeader());
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await axios.put(`${API_URL}/api/users/me`, data, authHeader());
  return res.data;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  const res = await axios.post(`${API_URL}/api/upload-profile`, formData, {
    headers: {
      ...authHeader().headers,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};
