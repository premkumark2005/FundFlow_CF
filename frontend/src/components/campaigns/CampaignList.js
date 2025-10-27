import React from 'react';
import CampaignCard from './CampaignCard';
import Loading from '../common/Loading';

const CampaignList = ({ campaigns, loading, title = "Campaigns", emptyMessage = "No campaigns found" }) => {
  if (loading) {
    return <Loading text="Loading campaigns..." />;
  }

  return (
    <div>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;