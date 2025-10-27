import React, { useState, useEffect } from 'react';
import { donationAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await donationAPI.getUserDonations();
      setDonations(response);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    return donation.paymentStatus === filter;
  });

  if (loading) return <Loading text="Loading donation history..." />;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Donation History</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Donations</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {filteredDonations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You haven't made any donations yet." 
              : `No ${filter} donations found.`
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Campaign</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation._id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <img
                        src={donation.campaignId.images[0] || '/default-campaign.jpg'}
                        alt={donation.campaignId.title}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                      <div>
                        <p className="font-medium">{donation.campaignId.title}</p>
                        <p className="text-sm text-gray-600">{donation.campaignId.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold">
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(donation.date)}
                  </td>
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4">
                    {donation.message ? (
                      <span className="text-sm text-gray-600" title={donation.message}>
                        {donation.message.length > 30 
                          ? `${donation.message.substring(0, 30)}...` 
                          : donation.message
                        }
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No message</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredDonations.length} of {donations.length} donations
        </p>
        
        {filteredDonations.length > 10 && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default DonationHistory;