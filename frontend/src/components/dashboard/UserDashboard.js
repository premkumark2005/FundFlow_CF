import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalCampaigns: 0,
    lastDonation: null
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      fetchDonations(user._id);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const fetchDonations = async (userId) => {
    try {
      const response = await donationAPI.getUserDonations(userId);
      setDonations(response);
      
      // Calculate stats
      const totalDonated = response.reduce((sum, donation) => sum + donation.amount, 0);
      const totalCampaigns = new Set(response.map(d => d.campaignId._id)).size;
      const lastDonation = response.length > 0 ? response[0] : null;
      
      setStats({ totalDonated, totalCampaigns, lastDonation });
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!user || !user._id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700 mb-4">You must be logged in to view your dashboard.</p>
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Donated</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(stats.totalDonated)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Campaigns Supported</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalCampaigns}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Last Donation</h3>
          {stats.lastDonation ? (
            <>
              <p className="text-xl font-bold">
                {formatCurrency(stats.lastDonation.amount)}
              </p>
              <p className="text-sm text-gray-600">
                to {stats.lastDonation.campaignId.title}
              </p>
              <p className="text-xs text-gray-500">
                on {formatDate(stats.lastDonation.date)}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No donations yet</p>
          )}
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Donations</h2>
          <Link
            to="/campaigns"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Support More Campaigns
          </Link>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't made any donations yet.</p>
            <Link
              to="/campaigns"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Campaigns
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Campaign</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation._id} className="border-b">
                    <td className="py-4">
                      <Link
                        to={`/campaigns/${donation.campaignId._id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {donation.campaignId.title}
                      </Link>
                    </td>
                    <td className="py-4 font-semibold">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="py-4 text-gray-600">
                      {formatDate(donation.date)}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        donation.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donation.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;