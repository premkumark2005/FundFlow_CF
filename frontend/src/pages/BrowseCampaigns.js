import React, { useState, useEffect } from 'react';
import CampaignCard from '../components/campaigns/CampaignCard';
import { campaignAPI } from '../services/api';
import Loading from '../components/common/Loading';

const BrowseCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchCampaigns();
  }, [filters, pagination.page]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getCampaigns({
        ...filters,
        page: pagination.page,
        limit: 12
      });
      
      if (response && response.campaigns) {
        setCampaigns(response.campaigns);
        setPagination({
          ...pagination,
          totalPages: response.totalPages,
          total: response.total
        });
      } else {
        console.error('Invalid response format:', response);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const categories = [
    'All', 'Education', 'Health', 'Tech', 'Charity', 'Environment', 'Arts', 'Other'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest' },
    { value: 'raisedAmount', label: 'Most Funded' },
    { value: 'deadline', label: 'Ending Soon' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Browse Campaigns</h1>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <Loading text="Loading campaigns..." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {campaigns.map(campaign => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>

          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No campaigns found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 py-1 rounded ${
                      pagination.page === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseCampaigns;