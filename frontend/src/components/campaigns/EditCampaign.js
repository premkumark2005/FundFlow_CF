import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaign } from '../../context/CampaignContext';
import { uploadAPI } from '../../services/api';
import Loading from '../common/Loading';

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampaign, updateCampaign, loading } = useCampaign();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    goal: '',
    deadline: '',
    category: 'Education'
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await getCampaign(id);
      const campaign = response.campaign;
      
      setFormData({
        title: campaign.title,
        description: campaign.description,
        shortDescription: campaign.shortDescription || '',
        goal: campaign.goal,
        deadline: new Date(campaign.deadline).toISOString().split('T')[0],
        category: campaign.category
      });
      
      setExistingImages(campaign.images);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError('Failed to load campaign');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages(existingImages.filter(img => img !== imageUrl));
    setRemovedImages([...removedImages, imageUrl]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      // Upload new images
      const uploadedImageUrls = [];
      if (newImages.length > 0) {
        for (const image of newImages) {
          const formData = new FormData();
          formData.append('image', image);
          const response = await uploadAPI.uploadImage(formData);
          uploadedImageUrls.push(response.imageUrl);
        }
      }

      // Prepare campaign data
      const campaignData = {
        ...formData,
        goal: Number(formData.goal),
        images: [...existingImages, ...uploadedImageUrls]
      };

      await updateCampaign(id, campaignData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update campaign');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit Campaign</h1>
      
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
            Campaign Images
          </label>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Images:</p>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Campaign image ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(image)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">New Images:</p>
              <div className="grid grid-cols-3 gap-2">
                {newImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New image ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload additional images for your campaign
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCampaign;