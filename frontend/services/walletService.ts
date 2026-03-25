import { User } from '../types';
import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

interface WalletBalance {
  coins: number;
}

interface WalletEnvelope {
  success: boolean;
  data: WalletBalance;
  message?: string;
}

const requestWallet = async (path: string, init?: RequestInit): Promise<WalletEnvelope> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    ...init,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.detail || json?.message || 'Wallet request failed');
  }

  return json as WalletEnvelope;
};

export const spendCoins = async (amount: number, reason: string): Promise<number> => {
  const response = await requestWallet('/api/wallet/spend', {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  });
  return response.data.coins;
};

export const rechargeCoins = async (amount: number, reason = 'manual_recharge'): Promise<number> => {
  const response = await requestWallet('/api/wallet/recharge', {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  });
  return response.data.coins;
};

export const applyCoinsToUser = (user: User | null, coins: number): User | null => {
  if (!user) {
    return null;
  }
  return { ...user, coins };
};
