import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, uploadAPI } from '../services/api';
import Loading from '../components/common/Loading';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    socialLinks: {
      website: '',
      twitter: '',
      facebook: '',
      instagram: ''
    }
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getProfile();
      if (!response) {
        throw new Error('Failed to fetch profile data');
      }
      setProfile(response);
      setFormData({
        name: response.name || '',
        bio: response.bio || '',
        socialLinks: response.socialLinks || {
          website: '',
          twitter: '',
          facebook: '',
          instagram: ''
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadAPI.uploadProfilePicture(formData);
      setProfile(prev => ({ ...prev, profilePic: response.profilePic }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile(formData);
      setProfile(response);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-600">Error loading profile: {error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p>No profile data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={profile?.profilePic || '/default-avatar.png'}
                alt={profile?.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              {editing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
            {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
          </div>

          {/* Profile Form */}
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.socialLinks).map(([platform, value]) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {platform}
                        </label>
                        <input
                          type="url"
                          name={`socialLinks.${platform}`}
                          value={value}
                          onChange={handleInputChange}
                          placeholder={`https://${platform}.com/username`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{profile?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500 capitalize">Role: {user?.role}</p>
                </div>

                {profile?.bio && (
                  <div>
                    <h3 className="font-semibold mb-1">Bio</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}

                {profile?.socialLinks && Object.values(profile.socialLinks).some(val => val) && (
                  <div>
                    <h3 className="font-semibold mb-2">Social Links</h3>
                    <div className="flex space-x-4">
                      {Object.entries(profile.socialLinks).map(([platform, url]) =>
                        url && (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {platform}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;