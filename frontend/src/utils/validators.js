export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateCampaign = (campaignData) => {
  const errors = {};

  if (!campaignData.title || campaignData.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters long';
  }

  if (!campaignData.description || campaignData.description.trim().length < 50) {
    errors.description = 'Description must be at least 50 characters long';
  }

  if (!campaignData.goal || campaignData.goal < 1000) {
    errors.goal = 'Goal must be at least ₹1000';
  }

  if (!campaignData.deadline || new Date(campaignData.deadline) <= new Date()) {
    errors.deadline = 'Deadline must be a future date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};