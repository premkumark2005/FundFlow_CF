import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import Loading from '../components/common/Loading';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [campaignActionLoading, setCampaignActionLoading] = useState(false);

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
      setUserActionLoading(true);
      await adminAPI.updateUserStatus(userId, { isActive });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleCampaignStatusChange = async (campaignId, status) => {
    try {
      setCampaignActionLoading(true);
      await adminAPI.updateCampaignStatus(campaignId, { status });
      setCampaigns(campaigns.map(campaign => 
        campaign._id === campaignId ? { ...campaign, status } : campaign
      ));
    } catch (error) {
      console.error('Error updating campaign status:', error);
    } finally {
      setCampaignActionLoading(false);
    }
  };

  if (loading) return <Loading text="Loading admin panel..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'users', 'campaigns', 'donations'].map((tab) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Donations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
              {stats.recentDonations.length === 0 ? (
                <p className="text-gray-500">No recent donations</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentDonations.slice(0, 5).map((donation) => (
                    <div key={donation._id} className="flex items-center justify-between p-3 border-b">
                      <div>
                        <p className="font-medium">
                          {donation.donorId?.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-600">{donation.campaignId?.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(donation.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(donation.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Campaigns</h2>
              {campaigns.slice(0, 5).length === 0 ? (
                <p className="text-gray-500">No recent campaigns</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign._id} className="flex items-center justify-between p-3 border-b">
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-sm text-gray-600">by {campaign.creatorId?.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img
                          src={user.profilePic || '/default-avatar.png'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        {user.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4 capitalize">{user.role}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleUserStatusChange(user._id, !user.isActive)}
                        disabled={userActionLoading}
                        className={`px-3 py-1 rounded text-sm ${
                          user.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50`}
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
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Creator</th>
                  <th className="text-left py-3 px-4">Goal</th>
                  <th className="text-left py-3 px-4">Raised</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img
                          src={campaign.images[0] || '/default-campaign.jpg'}
                          alt={campaign.title}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                        <span className="font-medium">{campaign.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{campaign.creatorId?.name}</td>
                    <td className="py-3 px-4">{formatCurrency(campaign.goal)}</td>
                    <td className="py-3 px-4 font-semibold">
                      {formatCurrency(campaign.raisedAmount)}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      {formatDate(campaign.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {campaign.status === 'pending' && (
                          <button
                            onClick={() => handleCampaignStatusChange(campaign._id, 'active')}
                            disabled={campaignActionLoading}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {campaign.status === 'active' && (
                          <button
                            onClick={() => handleCampaignStatusChange(campaign._id, 'suspended')}
                            disabled={campaignActionLoading}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        {campaign.status === 'suspended' && (
                          <button
                            onClick={() => handleCampaignStatusChange(campaign._id, 'active')}
                            disabled={campaignActionLoading}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 disabled:opacity-50"
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

      {/* Donations Tab */}
      {activeTab === 'donations' && stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Donations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Donor</th>
                  <th className="text-left py-3 px-4">Campaign</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDonations.map((donation) => (
                  <tr key={donation._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {donation.anonymous ? 'Anonymous' : donation.donorId?.name}
                    </td>
                    <td className="py-3 px-4">{donation.campaignId?.title}</td>
                    <td className="py-3 px-4 font-semibold">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(donation.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        donation.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : donation.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donation.paymentStatus}
                      </span>
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

export default AdminPanel;