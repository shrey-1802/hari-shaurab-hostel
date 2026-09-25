import { API_BASE_URL } from '../utils/constants';

// Token helpers
const TOKEN_KEY = 'hs_auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Universal Fetch Client configured for Render Backend API
 */
export const apiClient = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      removeToken();
      // Only redirect if not already on login or landing page
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || data?.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // If backend on Render is offline/sleeping or mock fallback is enabled
    console.warn(`[API Client Warning] Request to ${url} failed:`, error.message);
    throw error;
  }
};
