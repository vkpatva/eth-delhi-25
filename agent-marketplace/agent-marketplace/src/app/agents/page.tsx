"use client";

import { useState } from "react";
import { useAgentRegistry } from "@/hooks/useAgentRegistry";
import AgentCard from "@/components/AgentCard";
import { CHAINS, DEFAULT_CHAIN } from "@/config/chains";

export default function AgentRegistryPage() {
  const [selectedChain, setSelectedChain] = useState<string>(DEFAULT_CHAIN);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const {
    agents,
    loading,
    error,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    loadNextPage,
    loadPreviousPage,
    pagination
  } = useAgentRegistry(selectedChain);

  const handleChainChange = (chain: string) => {
    setSelectedChain(chain);
    setIsDropdownOpen(false);
  };

  // Loading state
  if (loading && agents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Registry</h1>
          <p className="text-lg text-gray-600">Discover and interact with AI agents across multiple blockchains</p>
        </div>

        {/* Chain Selector */}
        <div className="relative max-w-xs mx-auto mb-8">
          <button
            type="button"
            className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="flex items-center">
              <span className="ml-3 block truncate">
                {CHAINS[selectedChain]?.name || 'Select a network'}
              </span>
            </span>
            <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
              <ul className="max-h-60 overflow-auto rounded-md py-1 text-base focus:outline-none sm:text-sm">
                {Object.entries(CHAINS).map(([chainId, chain]) => (
                  <li
                    key={chainId}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                      selectedChain === chainId
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => handleChainChange(chainId)}
                  >
                    <div className="flex items-center">
                      <span className="ml-3 block font-normal truncate">
                        {chain.name}
                      </span>
                    </div>
                    {selectedChain === chainId && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && agents.length === 0 && (
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No agents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no agents registered on {CHAINS[selectedChain]?.name || 'this network'} yet.
            </p>
          </div>
        )}

        {/* Agents List */}
        {agents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 text-center">
                  Page {currentPage} • Showing {agents.length} agents on {CHAINS[selectedChain]?.name}
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {agents.map((agent) => (
                  <AgentCard 
                    key={agent.id}
                    agent={agent}
                    chainName={CHAINS[selectedChain]?.name || 'Unknown Chain'}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={loadPreviousPage}
                  disabled={!hasPreviousPage || loading}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    hasPreviousPage 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {pagination?.totalPages || 1}
                </span>
                
                <button
                  onClick={loadNextPage}
                  disabled={!hasNextPage || loading}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    hasNextPage 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
