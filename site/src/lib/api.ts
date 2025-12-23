import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Endpoints
export const getUserStats = async (address: string) => {
  const response = await api.get(`/user/${address}/stats`);
  return response.data;
};

export const getUserHistory = async (
  address: string,
  page = 1,
  limit = 20,
  type?: 'Deposit' | 'Withdrawal' | 'Reward' | 'Unstake'
) => {
  const params: any = { page, limit };
  if (type) params.type = type;
  
  const response = await api.get(`/user/${address}/history`, { params });
  return response.data;
};

export const getUserRewards = async (address: string) => {
  const response = await api.get(`/user/${address}/rewards`);
  return response.data;
};

export const getVaultInfo = async () => {
  const response = await api.get('/vault/info');
  return response.data;
};

export const getDrawHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/vault/draws', {
    params: { page, limit },
  });
  return response.data;
};

// Admin Endpoints (not used in frontend but included for completeness)
export const getAdminStats = async (adminSecret: string) => {
  const response = await api.get('/admin/stats', {
    headers: { 'X-Admin-Secret': adminSecret },
  });
  return response.data;
};

// Utility functions
export const formatCSPR = (motes: string | number): string => {
  const value = typeof motes === 'string' ? parseFloat(motes) : motes;
  return (value / 1_000_000_000).toFixed(2);
};

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default api;
