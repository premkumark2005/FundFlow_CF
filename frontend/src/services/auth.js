import api, { publicAPI } from './apiCore';

export const authAPI = {
  login: (email, password) =>
    publicAPI.post('/api/auth/login', { email, password }),

  register: (userData) =>
    publicAPI.post('/api/auth/register', userData),

  getMe: () =>
    api.get('/api/auth/me'),
};
