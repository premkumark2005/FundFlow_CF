
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaign } from '../../context/CampaignContext';
import DonateForm from '../donations/DonateForm';
import { formatCurrency, calculateDaysLeft, formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';

const CampaignDetail = () => {
  const { id } = useParams();
  const { getCampaign, loading, error } = useCampaign();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('story');
  const [localError, setLocalError] = useState(null);


  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await getCampaign(id);
      setCampaign(response.campaign);
      setDonations(response.donations);
      setLocalError(null);
    } catch (error) {
      setLocalError(error?.message || 'Failed to load campaign.');
      setCampaign(null);
      setDonations([]);
    }
  };

  if (loading) return <Loading />;
  if (error || localError) return <div className="container mx-auto px-4 py-8 text-center text-red-600 font-semibold">{error || localError}</div>;
  if (!campaign) return <div className="container mx-auto px-4 py-8 text-center text-red-600 font-semibold">Campaign not found</div>;

  const progress = (campaign.raisedAmount / campaign.goal) * 100;
  const daysLeft = calculateDaysLeft(campaign.deadline);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Campaign Images */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <img
              src={campaign.images[0] || '/default-campaign.jpg'}
              alt={campaign.title}
              className="w-full h-64 object-cover"
            />
            {campaign.images.length > 1 && (
              <div className="p-4 grid grid-cols-3 gap-2">
                {campaign.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${campaign.title} ${index + 2}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Campaign Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
            
            <div className="flex items-center mb-4">
              <img
                src={campaign.creatorId.profilePic || '/default-avatar.png'}
                alt={campaign.creatorId.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">By {campaign.creatorId.name}</p>
                <p className="text-sm text-gray-600">{campaign.category}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{progress.toFixed(1)}% funded</span>
                <span>{formatCurrency(campaign.raisedAmount)} raised of {formatCurrency(campaign.goal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold">{campaign.donorsCount}</p>
                <p className="text-sm text-gray-600">Supporters</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{daysLeft}</p>
                <p className="text-sm text-gray-600">Days left</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{donations.length}</p>
                <p className="text-sm text-gray-600">Donations</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{campaign.shortDescription}</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['story', 'updates', 'comments', 'supporters'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 font-medium border-b-2 capitalize ${
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

            <div className="p-6">
              {activeTab === 'story' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Story</h3>
                  <div className="prose max-w-none">
                    {campaign.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'updates' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Updates</h3>
                  {campaign.updates && campaign.updates.length > 0 ? (
                    campaign.updates.map((update, index) => (
                      <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                        <h4 className="font-semibold mb-2">{update.title}</h4>
                        <p className="text-gray-600 mb-2">{update.content}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(update.date)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No updates yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'supporters' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Supporters ({donations.length})</h3>
                  {donations.length > 0 ? (
                    <div className="space-y-3">
                      {donations.map((donation) => (
                        <div key={donation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <img
                              src={donation.anonymous ? '/default-avatar.png' : (donation.donorId?.profilePic || '/default-avatar.png')}
                              alt={donation.anonymous ? 'Anonymous' : donation.donorId?.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                              <p className="font-medium">
                                {donation.anonymous ? 'Anonymous' : donation.donorId?.name}
                              </p>
                              {donation.message && (
                                <p className="text-sm text-gray-600">"{donation.message}"</p>
                              )}
                            </div>
                          </div>
                          <p className="font-semibold">{formatCurrency(donation.amount)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No supporters yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <DonateForm campaign={campaign} />
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-semibold mb-4">Campaign Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{campaign.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Goal</p>
                <p className="font-medium">{formatCurrency(campaign.goal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-medium">{formatDate(campaign.deadline)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{formatDate(campaign.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-semibold mb-4">Creator</h3>
            <div className="flex items-center mb-4">
              <img
                src={campaign.creatorId.profilePic || '/default-avatar.png'}
                alt={campaign.creatorId.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{campaign.creatorId.name}</p>
                <p className="text-sm text-gray-600">Campaign Creator</p>
              </div>
            </div>
            {campaign.creatorId.bio && (
              <p className="text-gray-700 text-sm">{campaign.creatorId.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;