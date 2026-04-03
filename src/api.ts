export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || '';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
