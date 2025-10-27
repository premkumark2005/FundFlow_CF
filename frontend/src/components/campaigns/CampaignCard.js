import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, calculateDaysLeft } from '../../utils/formatters';

const CampaignCard = ({ campaign }) => {
  const progress = (campaign.raisedAmount / campaign.goal) * 100;
  const daysLeft = calculateDaysLeft(campaign.deadline);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/campaigns/${campaign._id}`}>
        <div className="relative h-48 w-full">
          <img
            src={campaign.images[0] || '/default-campaign.jpg'}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              campaign.status === 'pending' 
                ? 'bg-yellow-500 text-white'
                : campaign.status === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
            {campaign.category}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/campaigns/${campaign._id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
            {campaign.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.shortDescription || campaign.description}
        </p>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{progress.toFixed(0)}% funded</span>
            <span>{formatCurrency(campaign.raisedAmount)} raised</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </span>
          <Link
            to={`/campaigns/${campaign._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Donate Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;