// Update src/hooks/useAgentRegistry.ts
import { useState, useEffect, useCallback } from "react";

interface AgentInfo {
  id: string;
  did: string;
  description: string;
  serviceEndpoint: string;
}

export const useAgentRegistry = (chainId: string) => {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchAgents = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/agents?chainId=${chainId}&page=${page}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch agents");
        }

        const data = await response.json();
        
        if (!data.pagination) {
          throw new Error("Invalid response format from server");
        }

        setAgents(data.data || []);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        });
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError(err instanceof Error ? err.message : "Failed to load agents. Please try again later.");
        setAgents([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        });
      } finally {
        setLoading(false);
      }
    },
    [chainId]
  );

  useEffect(() => {
    fetchAgents(1);
  }, [fetchAgents]);

  const loadNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      fetchAgents(pagination.page + 1);
    }
  };

  const loadPreviousPage = () => {
    if (pagination.page > 1) {
      fetchAgents(pagination.page - 1);
    }
  };

  return {
    agents,
    loading,
    error,
    pagination,
    loadNextPage,
    loadPreviousPage,
    currentPage: pagination.page,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPreviousPage: pagination.page > 1,
  };
};
