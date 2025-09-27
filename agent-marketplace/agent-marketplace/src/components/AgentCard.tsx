import React from 'react';
import { ethers } from 'ethers';

interface AgentCardProps {
  agent: {
    did: string;
    id: string;  // Changed from ethers.BigNumber to string
    description: string;
    serviceEndpoint: string;
  };
  chainName: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, chainName }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Agent #{agent.id}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-medium">Chain:</span> {chainName}
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {chainName}
        </span>
      </div>
      
      <div className="mt-4">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-600">DID</h4>
          <p className="text-sm text-gray-800 break-all">{agent.did}</p>
        </div>
        
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-600">Description</h4>
          <p className="text-sm text-gray-800">
            {agent.description || 'No description provided'}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600">Service Endpoint</h4>
          <a 
            href={agent.serviceEndpoint} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm break-all"
          >
            {agent.serviceEndpoint}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
