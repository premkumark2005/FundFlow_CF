import api from './api';

export const uploadAPI = {
  uploadImage: (formData) => 
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
};