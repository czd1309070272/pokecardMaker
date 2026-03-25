import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const AUTH_TOKEN_KEY = 'auth_token';

interface AuthUser {
  id: number;
  email: string;
  nickname: string;
  coins: number;
}

interface AuthTokenPayload {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface AuthCredentials {
  email: string;
  password: string;
  nickname?: string;
}

const toUser = (authUser: AuthUser): User => ({
  id: authUser.id,
  email: authUser.email,
  name: authUser.nickname,
  created: new Date().toISOString(),
  coins: authUser.coins ?? 0,
});

const saveToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY);

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.detail || json?.message || 'Request failed');
  }
  return json as T;
};

export const loginWithEmail = async (credentials: AuthCredentials): Promise<User> => {
  const response = await request<ApiEnvelope<AuthTokenPayload>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  saveToken(response.data.access_token);
  return toUser(response.data.user);
};

export const registerWithEmail = async (credentials: AuthCredentials): Promise<User> => {
  const response = await request<ApiEnvelope<AuthTokenPayload>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      nickname: credentials.nickname,
    }),
  });

  saveToken(response.data.access_token);
  return toUser(response.data.user);
};

export const restoreCurrentUser = async (): Promise<User | null> => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await request<ApiEnvelope<AuthUser>>('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return toUser(response.data);
  } catch (error) {
    clearAuthToken();
    return null;
  }
};

export const logout = () => {
  clearAuthToken();
};

export const requestPasswordReset = async () => {
  throw new Error('Password reset is not available yet.');
};
