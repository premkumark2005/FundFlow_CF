import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, usersData, campaignsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getCampaigns()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, { isActive });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleCampaignStatusChange = async (campaignId, status) => {
    try {
      await adminAPI.updateCampaignStatus(campaignId, { status });
      setCampaigns(campaigns.map(campaign => 
        campaign._id === campaignId ? { ...campaign, status } : campaign
      ));
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'users', 'campaigns'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Campaigns</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalCampaigns}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Donations</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalDonations}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Raised</h3>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(stats.totalRaised)}
              </p>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
            {stats.recentDonations.length === 0 ? (
              <p className="text-gray-500">No recent donations</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Donor</th>
                      <th className="text-left py-2">Campaign</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentDonations.map((donation) => (
                      <tr key={donation._id} className="border-b">
                        <td className="py-3">
                          {donation.donorId?.name || 'Anonymous'}
                        </td>
                        <td className="py-3">
                          {donation.campaignId?.title}
                        </td>
                        <td className="py-3 font-semibold">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="py-3 text-gray-600">
                          {formatDate(donation.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Users Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-3">{user.name}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3 capitalize">{user.role}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleUserStatusChange(user._id, !user.isActive)}
                        className={`px-3 py-1 rounded text-sm ${
                          user.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Campaigns Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Creator</th>
                  <th className="text-left py-2">Goal</th>
                  <th className="text-left py-2">Raised</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="border-b">
                    <td className="py-3">{campaign.title}</td>
                    <td className="py-3">{campaign.creatorId?.name}</td>
                    <td className="py-3">{formatCurrency(campaign.goal)}</td>
                    <td className="py-3 font-semibold">
                      {formatCurrency(campaign.raisedAmount)}
                    </td>
                    <td className="py-3">
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
                    <td className="py-3">
                      <div className="flex space-x-2">
                        {campaign.status === 'pending' && (
                          <button
                            onClick={() => handleCampaignStatusChange(campaign._id, 'active')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                          >
                            Approve
                          </button>
                        )}
                        {campaign.status === 'active' && (
                          <button
                            onClick={() => handleCampaignStatusChange(campaign._id, 'suspended')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                          >
                            Suspend
                          </button>
                        )}
                        {campaign.status === 'suspended' && (
                          <button
                            onClick={() => handleCampaignStatusChange(campaign._id, 'active')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;