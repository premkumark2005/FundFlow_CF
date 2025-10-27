import React, { createContext, useContext, useReducer } from 'react';
import { campaignAPI } from '../services/api';

const CampaignContext = createContext();

const campaignReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [action.payload, ...state.campaigns] };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign =>
          campaign._id === action.payload._id ? action.payload : campaign
        )
      };
    default:
      return state;
  }
};

const initialState = {
  campaigns: [],
  loading: false,
  error: null
};

export const CampaignProvider = ({ children }) => {
  const [state, dispatch] = useReducer(campaignReducer, initialState);

  const getCampaigns = async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await campaignAPI.getCampaigns(params);
      dispatch({ type: 'SET_CAMPAIGNS', payload: response.campaigns });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getCampaign = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await campaignAPI.getCampaign(id);
      // Ensure global loading state is cleared after successful fetch
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const createCampaign = async (campaignData) => {
    try {
      const response = await campaignAPI.createCampaign(campaignData);
      dispatch({ type: 'ADD_CAMPAIGN', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateCampaign = async (id, campaignData) => {
    try {
      const response = await campaignAPI.updateCampaign(id, campaignData);
      dispatch({ type: 'UPDATE_CAMPAIGN', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  return (
    <CampaignContext.Provider value={{
      campaigns: state.campaigns,
      loading: state.loading,
      error: state.error,
      getCampaigns,
      getCampaign,
      createCampaign,
      updateCampaign,
      clearError
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};