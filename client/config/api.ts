/**
 * API Configuration
 */

// Base URL del API - se puede cambiar usando la variable de entorno VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Helper para construir URLs de API
export const buildApiUrl = (endpoint: string): string => {
  // Asegurar que el endpoint empiece con /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

// URLs de endpoints específicos
export const API_ENDPOINTS = {
  // Auth
  LOGIN: buildApiUrl('/api/auth/login'),
  
  // Users
  USERS: buildApiUrl('/api/users'),
  USER_BY_ID: (id: string) => buildApiUrl(`/api/users/${id}`),
  
  // Bots
  BOTS: buildApiUrl('/api/bots'),
  BOT_BY_ID: (id: string) => buildApiUrl(`/api/bots/${id}`),
  BOT_QR_PUBLIC: (id: string) => buildApiUrl(`/api/bots/${id}/qr-public`),
  BOT_CONNECT: (id: string) => buildApiUrl(`/api/bots/${id}/connect`),
  BOT_DISCONNECT: (id: string) => buildApiUrl(`/api/bots/${id}/disconnect`),
  BOT_RESTART: (id: string) => buildApiUrl(`/api/bots/${id}/restart`),
  BOT_MESSAGES: (id: string) => buildApiUrl(`/api/bots/${id}/messages`),
  BOT_SEND_MESSAGE: (botId: string) => buildApiUrl(`/api/bots/${botId}/send`),
  
  // Ping
  PING: buildApiUrl('/api/ping'),
} as const;