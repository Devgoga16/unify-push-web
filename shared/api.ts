/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Login request interface
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * User interface for login response
 */
export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string; // Para mensajes de error
}

/**
 * User with database fields for CRUD operations
 */
export interface UserWithTimestamps {
  _id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Users list response interface
 */
export interface UsersListResponse {
  success: boolean;
  count: number;
  data: UserWithTimestamps[];
  message?: string;
}

/**
 * User creation/update request
 */
export interface UserRequest {
  name: string;
  username: string;
  password?: string; // Optional for updates
  role: string;
  isActive: boolean;
}

/**
 * Single user response
 */
export interface UserResponse {
  success: boolean;
  data: UserWithTimestamps;
  message?: string;
}

/**
 * Bot settings interface
 */
export interface BotSettings {
  autoReply: boolean;
  welcomeMessage: string;
  maxMessagesPerMinute: number;
}

/**
 * Bot interface with database fields
 */
export interface Bot {
  _id: string;
  name: string;
  description: string;
  status: 'pending' | 'connected' | 'disconnected' | 'error';
  qrCode: string | null;
  phoneNumber: string | null;
  owner: string;
  isActive: boolean;
  apiKey: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  endpointUrl: string;
  settings: BotSettings;
  // Real-time properties added by WebSocket updates
  realTime?: {
    clientExists: boolean;
    hasQR: boolean;
    isReady: boolean;
  };
  isReady?: boolean;
}

/**
 * Bot creation/update request
 */
export interface BotRequest {
  name: string;
  description: string;
  settings?: Partial<BotSettings>;
  isActive?: boolean;
}

/**
 * Bots list response interface
 */
export interface BotsListResponse {
  success: boolean;
  count: number;
  data: Bot[];
  message?: string;
}

/**
 * Single bot response
 */
export interface BotResponse {
  success: boolean;
  data: Bot;
  message?: string;
}

/**
 * Send message request interface
 */
export interface SendMessageRequest {
  to: string;
  message: string;
}

/**
 * Send message response interface
 */
export interface SendMessageResponse {
  success: boolean;
  data: {
    messageId: string;
    message: string;
    bot: {
      name: string;
      phoneNumber: string;
    };
  };
  message?: string;
}

/**
 * Message history interface
 */
export interface Message {
  _id: string;
  bot: string;
  to: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  messageId: string | null;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Messages pagination interface
 */
export interface MessagesPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Messages list response interface
 */
export interface MessagesResponse {
  success: boolean;
  data: Message[];
  pagination: MessagesPagination;
  message?: string;
}
