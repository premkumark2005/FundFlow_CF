import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI } from '../../services/api';
import { formatCurrency, calculateDaysLeft, formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';

const CreatorDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
    activeCampaigns: 0
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getUserCampaigns();
      setCampaigns(response);
      
      // Calculate stats
      const totalRaised = response.reduce((sum, campaign) => sum + campaign.raisedAmount, 0);
      const totalCampaigns = response.length;
      const activeCampaigns = response.filter(campaign => 
        campaign.status === 'active' && calculateDaysLeft(campaign.deadline) > 0
      ).length;
      
      setStats({ totalRaised, totalCampaigns, activeCampaigns });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <Link
          to="/create-campaign"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Campaign
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Raised</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.totalRaised)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Campaigns</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalCampaigns}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.activeCampaigns}</p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">My Campaigns</h2>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't created any campaigns yet.</p>
            <Link
              to="/create-campaign"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Campaign</th>
                  <th className="text-left py-2">Goal</th>
                  <th className="text-left py-2">Raised</th>
                  <th className="text-left py-2">Progress</th>
                  <th className="text-left py-2">Deadline</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const progress = (campaign.raisedAmount / campaign.goal) * 100;
                  const daysLeft = calculateDaysLeft(campaign.deadline);
                  
                  return (
                    <tr key={campaign._id} className="border-b">
                      <td className="py-4">
                        <Link
                          to={`/campaigns/${campaign._id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {campaign.title}
                        </Link>
                      </td>
                      <td className="py-4">{formatCurrency(campaign.goal)}</td>
                      <td className="py-4 font-semibold">
                        {formatCurrency(campaign.raisedAmount)}
                      </td>
                      <td className="py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {progress.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`${daysLeft < 7 ? 'text-red-600' : 'text-gray-600'}`}>
                          {daysLeft} days left
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link
                          to={`/campaigns/${campaign._id}/edit`}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/campaigns/${campaign._id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;