import api, { publicAPI } from './apiCore';

export const authAPI = {
  login: (email, password) => 
    publicAPI.post('/auth/login', { email, password }),
  
  register: (userData) => 
    publicAPI.post('/auth/register', userData),
  
  getMe: () => 
    api.get('/auth/me'),
};