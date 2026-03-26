import { CardComment, CardData } from '../types';
import { getAuthToken } from './authService';
import { normalizeRarity } from '../lib/rarity';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

interface SavedCardRecord {
  id: string;
  uuid?: string | null;
  name?: string;
  image?: string | null;
  supertype?: string | null;
  subtype?: string | null;
  rarity?: string | null;
  element_type?: string | null;
  hp?: string | null;
  illustrator?: string | null;
  set_number?: string | null;
  status?: string | null;
  source?: string | null;
  version?: number | null;
  is_public?: boolean;
  likes?: number;
  views_count?: number;
  forks_count?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  author_name?: string | null;
  published_at?: string | null;
  deleted_at?: string | null;
  favorited_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

interface PublicCardsPayload {
  list: SavedCardRecord[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface PublicCardsEnvelope {
  success: boolean;
  data: PublicCardsPayload;
}

interface DeleteCardEnvelope {
  success: boolean;
}

interface ToggleLikeEnvelope {
  success: boolean;
  data: {
    cardId: string;
    liked: boolean;
    newCount: number;
  };
}

interface ToggleFavoriteEnvelope {
  success: boolean;
  data: {
    cardId: string;
    favorited: boolean;
  };
}

interface SaveCardAppraisalPayload {
  price: string;
  comment: string;
  language: 'en' | 'zh-Hant';
}

interface CardCommentRecord {
  id: number;
  cardId: string;
  userId: number;
  authorName: string;
  content: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  isOwner?: boolean;
  canDelete?: boolean;
}

interface CardCommentEnvelope {
  success: boolean;
  data: CardCommentRecord;
}

interface CardCommentListEnvelope {
  success: boolean;
  data: {
    list: CardCommentRecord[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface DeleteCommentEnvelope {
  success: boolean;
}

const request = async <T>(path: string, init?: RequestInit, includeAuth = true): Promise<T> => {
  const token = includeAuth ? getAuthToken() : null;
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.detail || json?.message || 'Cards request failed');
  }

  return json as T;
};

const authorizedRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  return request<T>(path, init, true);
};

const normalizeSavedCard = (record: SavedCardRecord): CardData => ({
  ...record.data,
  id: record.id,
  image: record.data?.image ?? record.image ?? undefined,
  supertype: (record.data?.supertype ?? record.supertype) as CardData['supertype'],
  subtype: record.data?.subtype ?? record.subtype ?? '',
  rarity: normalizeRarity(record.data?.rarity ?? record.rarity),
  type: (record.data?.type ?? record.element_type) as CardData['type'],
  hp: record.data?.hp ?? record.hp ?? '',
  illustrator: record.data?.illustrator ?? record.illustrator ?? '',
  setNumber: record.data?.setNumber ?? record.set_number ?? '',
  likes: record.data?.likes ?? record.likes ?? 0,
  isLiked: record.data?.isLiked ?? record.isLiked ?? false,
  isFavorited: (record.data as any)?.isFavorited ?? record.isFavorited ?? false,
  isPublic: record.data?.isPublic ?? record.is_public ?? false,
  isDeleted: (record.data as any)?.isDeleted ?? Boolean(record.deleted_at),
  status: record.data?.status ?? record.status ?? undefined,
  publishedAt: record.data?.publishedAt ?? record.published_at ?? undefined,
  deletedAt: (record.data as any)?.deletedAt ?? record.deleted_at ?? undefined,
  favoritedAt: (record.data as any)?.favoritedAt ?? record.favorited_at ?? undefined,
  createdAt: (record.data as any)?.createdAt ?? record.created_at ?? undefined,
  updatedAt: (record.data as any)?.updatedAt ?? record.updated_at ?? undefined,
  authorName: (record.data as any)?.authorName ?? record.author_name ?? undefined,
});

const normalizeCardComment = (record: CardCommentRecord): CardComment => ({
  id: record.id,
  cardId: record.cardId,
  userId: record.userId,
  authorName: record.authorName,
  content: record.content,
  createdAt: record.createdAt ?? undefined,
  updatedAt: record.updatedAt ?? undefined,
  isOwner: record.isOwner ?? false,
  canDelete: record.canDelete ?? false,
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

export const fetchLikedCards = async (): Promise<CardData[]> => {
  const response = await authorizedRequest<SavedCardListEnvelope>('/api/cards/liked');
  return response.data.map(normalizeSavedCard);
};

export const fetchFavoritedCards = async (): Promise<CardData[]> => {
  const response = await authorizedRequest<SavedCardListEnvelope>('/api/cards/favorited');
  return response.data.map(normalizeSavedCard);
};

export const toggleCardFavoriteOnServer = async (
  cardId: string,
): Promise<{ cardId: string; favorited: boolean }> => {
  const response = await authorizedRequest<ToggleFavoriteEnvelope>(`/api/cards/${cardId}/favorite`, {
    method: 'POST',
  });
  return response.data;
};

export const fetchPublicCards = async (
  options: { page?: number; limit?: number; sort?: 'trending' | 'newest' | 'top_rated' } = {},
): Promise<{ cards: CardData[]; total: number; hasMore: boolean }> => {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.sort) params.set('sort', options.sort);

  const query = params.toString();
  const response = await request<PublicCardsEnvelope>(`/api/cards/public${query ? `?${query}` : ''}`, undefined, true);
  return {
    cards: response.data.list.map(normalizeSavedCard),
    total: response.data.total,
    hasMore: response.data.hasMore,
  };
};

export const publishCardToServer = async (cardId: string, isPublic = true): Promise<CardData> => {
  const response = await authorizedRequest<SavedCardEnvelope>(`/api/cards/${cardId}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ isPublic }),
  });
  return normalizeSavedCard(response.data);
};

export const toggleCardLikeOnServer = async (
  cardId: string,
): Promise<{ cardId: string; liked: boolean; newCount: number }> => {
  const response = await authorizedRequest<ToggleLikeEnvelope>(`/api/cards/${cardId}/like`, {
    method: 'POST',
  });
  return response.data;
};

export const saveCardAppraisalToServer = async (
  cardId: string,
  appraisal: SaveCardAppraisalPayload,
): Promise<CardData> => {
  const response = await authorizedRequest<SavedCardEnvelope>(`/api/cards/${cardId}/appraisal`, {
    method: 'POST',
    body: JSON.stringify(appraisal),
  });
  return normalizeSavedCard(response.data);
};

export const fetchCardComments = async (
  cardId: string,
  options: { page?: number; limit?: number } = {},
): Promise<{ comments: CardComment[]; page: number; limit: number; total: number; hasMore: boolean }> => {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));

  const query = params.toString();
  const response = await request<CardCommentListEnvelope>(
    `/api/cards/${cardId}/comments${query ? `?${query}` : ''}`,
    undefined,
    true,
  );
  return {
    comments: response.data.list.map(normalizeCardComment),
    page: response.data.page,
    limit: response.data.limit,
    total: response.data.total,
    hasMore: response.data.hasMore,
  };
};

export const createCardCommentOnServer = async (cardId: string, content: string): Promise<CardComment> => {
  const response = await authorizedRequest<CardCommentEnvelope>(`/api/cards/${cardId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return normalizeCardComment(response.data);
};

export const deleteCardCommentOnServer = async (cardId: string, commentId: number): Promise<void> => {
  await authorizedRequest<DeleteCommentEnvelope>(`/api/cards/${cardId}/comments/${commentId}`, {
    method: 'DELETE',
  });
};
