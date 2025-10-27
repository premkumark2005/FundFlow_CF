import api, { publicAPI } from './apiCore';

// Campaign API functions
export const campaignAPI = {
  getCampaigns: (params = {}) => 
    publicAPI.get('/campaigns', { params }), // Use public API for getting campaigns
  
  getCampaign: (id) => 
    publicAPI.get(`/campaigns/${id}`), // Use public API for getting single campaign
  
  createCampaign: (campaignData) => 
    api.post('/campaigns', campaignData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  updateCampaign: (id, campaignData) => 
    api.put(`/campaigns/${id}`, campaignData),
  
  getUserCampaigns: (userId) => 
  api.get(`/campaigns/user/${userId}`),
  
  deleteCampaign: (id) => 
    api.delete(`/campaigns/${id}`)
};

// Donation API functions
export const donationAPI = {
  createPaymentIntent: async (amount, campaignId) => {
    try {
      const response = await publicAPI.post('/donations/create-payment-intent', { 
        amount, 
        campaignId 
      });
      
      const { clientSecret } = response.data;
      
      if (!clientSecret) {
        throw new Error('Missing client secret from server');
      }
      
      return { clientSecret };
      
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  },
  
  recordStripeDonation: (donationData) => 
    api.post('/donations/record-stripe-donation', donationData),
  
  createDonation: (donationData) => 
    api.post('/donations', donationData),
  
  getUserDonations: (userId) => 
    api.get(`/donations/user/${userId}`),
  
  getCampaignDonations: (campaignId) => 
    api.get(`/donations/campaign/${campaignId}`)
};

// User API functions
export const userAPI = {
  getProfile: () => 
    api.get('/users/profile'),
  
  updateProfile: (profileData) => 
    api.put('/users/profile', profileData),
  
  uploadProfilePicture: (formData) => 
    api.post('/users/upload-profile-pic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  changePassword: (passwordData) => 
    api.post('/users/change-password', passwordData)
};

// Admin API functions
export const adminAPI = {
  getStats: () => 
    api.get('/admin/stats'),
  
  getUsers: () => 
    api.get('/admin/users'),
  
  updateUserStatus: (userId, statusData) => 
    api.put(`/admin/users/${userId}`, statusData),
  
  getCampaigns: () => 
    api.get('/admin/campaigns'),
  
  updateCampaignStatus: (campaignId, statusData) => 
    api.put(`/admin/campaigns/${campaignId}`, statusData),
  
  getDonations: () => 
    api.get('/admin/donations')
};

// Upload API functions
export const uploadAPI = {
  uploadImage: (formData) => 
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  uploadProfilePicture: (formData) => 
    api.post('/users/upload-profile-pic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

// Auth API functions
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getMe: () => 
    api.get('/auth/me'),
  
  verifyEmail: (token) => 
    api.post('/auth/verify-email', { token }),
  
  
  resetPassword: (token, password) => 
    api.post('/auth/reset-password', { token, password })
};

