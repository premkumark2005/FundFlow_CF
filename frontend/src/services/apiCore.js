import axios from 'axios';

// Base URL - Update to use the correct backend port
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Public API instance (no auth required)
const publicAPI = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30s request timeout - increased from 5s
});

// Private API instance (auth required)
const privateAPI = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30s request timeout - increased from 5s
});

// Request interceptor for adding auth token (only for private API)
privateAPI.interceptors.request.use(
  (config) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return Promise.reject(new Error('No user found'));
      }

      const user = JSON.parse(userStr);
      if (!user?.token) {
        localStorage.removeItem('user');
        return Promise.reject(new Error('Invalid user data'));
      }

      // Add auth header
      config.headers.Authorization = `Bearer ${user.token}`;
      return config;
    } catch (error) {
      localStorage.removeItem('user');
      return Promise.reject(new Error('Invalid user data format'));
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Common response interceptor for both instances
const responseInterceptor = (response) => {
  // For payment intent endpoint, return the full response
  if (response.config.url.includes('/create-payment-intent')) {
    return response;
  }
  // For other endpoints, return just the data
  return response.data;
};

const errorInterceptor = (error) => {
  // Handle authentication errors
  if (error.response?.status === 401) {
    localStorage.removeItem('user');
    // Use more graceful navigation instead of direct window.location
    if (!window.location.pathname.includes('/login')) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  // Format error message
  const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
  const formattedError = new Error(errorMessage);
  formattedError.status = error.response?.status;
  formattedError.data = error.response?.data;
  
  return Promise.reject(formattedError);
};

// Add response interceptors to both instances
publicAPI.interceptors.response.use(responseInterceptor, errorInterceptor);
privateAPI.interceptors.response.use(responseInterceptor, errorInterceptor);

// Default export for backward compatibility (use privateAPI)
const api = privateAPI;

export default api;
export { publicAPI, privateAPI };
