import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor — attach JWT token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================
// Auth API
// ========================

export const login = async (email, password) => {
  const { data } = await API.post('/auth/login', { email, password });
  return data;
};

export const signup = async (userData) => {
  const { data } = await API.post('/auth/signup', userData);
  return data;
};

export const googleAuth = async (credential) => {
  const { data } = await API.post('/auth/google', { credential });
  return data;
};

export const getMe = async () => {
  const { data } = await API.get('/auth/me');
  return data;
};

// ========================
// Registration API
// ========================

export const getMyRegistrations = async () => {
  const { data } = await API.get('/registrations/my');
  return data;
};

export const createRegistration = async (registrationData) => {
  const { data } = await API.post('/registrations', registrationData);
  return data;
};

export const getRegistration = async (id) => {
  const { data } = await API.get(`/registrations/${id}`);
  return data;
};

export const updateRegistration = async (id, registrationData) => {
  const { data } = await API.put(`/registrations/${id}`, registrationData);
  return data;
};



// ========================
// Admin API
// ========================

export const adminGetRegistrations = async () => {
  const { data } = await API.get('/admin/registrations');
  return data;
};



export default API;
