import { CardData } from '../types';
import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

interface SavedCardRecord {
  id: string;
  data: CardData;
}

interface SavedCardEnvelope {
  success: boolean;
  data: SavedCardRecord;
}

interface SavedCardListEnvelope {
  success: boolean;
  data: SavedCardRecord[];
}

interface DeleteCardEnvelope {
  success: boolean;
}

const authorizedRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
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
    throw new Error(json?.detail || json?.message || 'Cards request failed');
  }

  return json as T;
};

const normalizeSavedCard = (record: SavedCardRecord): CardData => ({
  ...record.data,
  id: record.id,
});

export const saveCardToServer = async (card: CardData): Promise<CardData> => {
  const response = await authorizedRequest<SavedCardEnvelope>('/api/cards/save', {
    method: 'POST',
    body: JSON.stringify({ card }),
  });
  return normalizeSavedCard(response.data);
};

export const updateCardOnServer = async (cardId: string, card: CardData): Promise<CardData> => {
  const response = await authorizedRequest<SavedCardEnvelope>(`/api/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify({ card }),
  });
  return normalizeSavedCard(response.data);
};

export const deleteCardFromServer = async (cardId: string): Promise<void> => {
  await authorizedRequest<DeleteCardEnvelope>(`/api/cards/${cardId}`, {
    method: 'DELETE',
  });
};

export const fetchMyCards = async (): Promise<CardData[]> => {
  const response = await authorizedRequest<SavedCardListEnvelope>('/api/cards/me');
  return response.data.map(normalizeSavedCard);
};
