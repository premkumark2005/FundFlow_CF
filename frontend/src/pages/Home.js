import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CampaignCard from '../components/campaigns/CampaignCard';
import { campaignAPI } from '../services/api';

const Home = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        const response = await campaignAPI.getCampaigns({
          limit: 6,
          sortBy: 'raisedAmount',
          sortOrder: 'desc'
        });
        setFeaturedCampaigns(response.campaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCampaigns();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Fund Ideas That Matter
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Support innovative projects and bring creative ideas to life. Join our community of backers and creators.
          </p>
          <div className="space-x-4">
            <Link
              to="/campaigns"
              className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Campaigns
            </Link>
            <Link
              to="/create-campaign"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
            >
              Start a Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Campaigns</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredCampaigns || []).map(campaign => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link
            to="/campaigns"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Campaigns
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create a Campaign</h3>
              <p className="text-gray-600">
                Share your story and set your funding goal. It's free and only takes a few minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Spread the Word</h3>
              <p className="text-gray-600">
                Share your campaign with friends, family, and your social networks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Funds</h3>
              <p className="text-gray-600">
                Get funds transferred securely when your campaign reaches its goal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;