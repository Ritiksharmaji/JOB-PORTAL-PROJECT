import axios from 'axios';
import api from '../api/client';
import { API_URL } from '../config';

// Login uses RAW axios (no token yet), exactly like the web AuthService.
// POST /auth/login -> { jwt }
export const loginUser = async (login) => {
  const res = await axios.post(`${API_URL}/auth/login`, login);
  return res.data;
};

// POST /users/register -> created UserDTO (password nulled). accountType: APPLICANT | EMPLOYER
export const registerUser = async (user) => {
  const res = await api.post('/users/register', user);
  return res.data;
};

// Password reset OTP flow (all public on the backend).
export const sendOtp = async (email) => {
  const res = await api.post(`/users/sendOtp/${encodeURIComponent(email)}`);
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await api.get(`/users/verifyOtp/${encodeURIComponent(email)}/${otp}`);
  return res.data;
};

// POST /users/changePass  body { email, password }
export const changePassword = async (email, password) => {
  const res = await api.post('/users/changePass', { email, password });
  return res.data;
};
