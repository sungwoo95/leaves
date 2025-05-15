// axiosInstance.ts
import axios from 'axios';
import { auth } from './firebase';

const axiosInstance = axios.create({
  baseURL: '/api',
});

axiosInstance.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
