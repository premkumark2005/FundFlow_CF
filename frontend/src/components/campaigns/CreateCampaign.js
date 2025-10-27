import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { campaignAPI, uploadAPI } from '../../services/api';

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    goal: '',
    deadline: '',
    category: 'Education'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create a new FormData object for the entire campaign
      const campaignFormData = new FormData();
      
      // Append campaign data
      campaignFormData.append('title', formData.title);
      campaignFormData.append('description', formData.description);
      campaignFormData.append('shortDescription', formData.shortDescription);
      campaignFormData.append('goal', Number(formData.goal));
      campaignFormData.append('deadline', formData.deadline);
      campaignFormData.append('category', formData.category);
      
      // Append images
      if (images.length > 0) {
        images.forEach(image => {
          campaignFormData.append('images', image);
        });
      }

      await campaignAPI.createCampaign(campaignFormData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'creator') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You need to be a campaign creator to create campaigns. Please update your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create a Campaign</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a compelling title for your campaign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description *
          </label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description that will appear on campaign cards"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell your story, explain your project, and why people should support it"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Goal (₹) *
            </label>
            <input
              type="number"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How much do you want to raise?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Deadline *
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Tech">Technology</option>
            <option value="Charity">Charity</option>
            <option value="Environment">Environment</option>
            <option value="Arts">Arts</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Images (Max 5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload high-quality images that represent your campaign
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;