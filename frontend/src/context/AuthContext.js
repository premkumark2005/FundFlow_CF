import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/auth';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload, user: null };
    case 'LOGOUT':
      return { ...state, user: null, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is logged in on app load
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      if (!user || !user.token) {
        localStorage.removeItem('user');
        return;
      }

      // Verify token is valid by making a request to /auth/me
      authAPI.getMe()
        .then(() => {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        })
        .catch(() => {
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        });
    } catch (error) {
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authAPI.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authAPI.register(userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      user: state.user,
      loading: state.loading,
      error: state.error,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};