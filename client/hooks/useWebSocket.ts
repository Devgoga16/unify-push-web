import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export interface BotStatusUpdate {
  botId: string;
  database: {
    status: string;
    phoneNumber?: string;
    lastActivity: string;
    qrCode: boolean;
  };
  realTime: {
    clientExists: boolean;
    hasQR: boolean;
    isReady: boolean;
  };
  isReady: boolean;
  timestamp: string;
}

export interface BotEvent {
  botId: string;
  timestamp: string;
  [key: string]: any;
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current || (socketRef.current && socketRef.current.connected)) {
      return;
    }

    const token = getToken();
    if (!token) {
      setConnectionError('No authentication token available');
      return;
    }

    isConnectingRef.current = true;

    try {
      const wsUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      console.log('🌐 WebSocket connecting to:', wsUrl);

      const newSocket = io(wsUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: false, // We'll handle reconnection manually
        upgrade: true
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        socketRef.current = newSocket;
        isConnectingRef.current = false;

        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = undefined;
        }

        // Start ping interval to keep connection alive (less frequent)
        pingIntervalRef.current = setInterval(() => {
          if (newSocket && newSocket.connected) {
            newSocket.emit('ping');
          }
        }, 60000); // 60 seconds instead of 30
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        isConnectingRef.current = false;

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = undefined;
        }

        // Only auto-reconnect for specific reasons
        if (reason === 'io server disconnect' || reason === 'ping timeout' || reason === 'transport close') {
          console.log('Attempting to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        } else if (reason === 'io client disconnect') {
          console.log('Client disconnected manually, not reconnecting');
        } else {
          console.log('Unexpected disconnect reason:', reason);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        isConnectingRef.current = false;

        // Retry connection after error
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 10000); // Wait 10 seconds before retrying
        }
      });

      newSocket.on('pong', () => {
        console.log('WebSocket pong received - connection alive');
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        setConnectionError(error.message || 'WebSocket error');
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
      isConnectingRef.current = false;
    }
  }, []); // Remove getToken dependency to prevent recreation

  const disconnect = useCallback(() => {
    console.log('Manually disconnecting WebSocket...');
    isConnectingRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = undefined;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  const joinBotRoom = useCallback((botId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join-bot-room', botId);
      console.log(`Joined bot room: ${botId}`);
    }
  }, []);

  const leaveBotRoom = useCallback((botId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave-bot-room', botId);
      console.log(`Left bot room: ${botId}`);
    }
  }, []);

  const requestBotStatus = useCallback((botId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('request-bot-status', botId);
      console.log(`Requested status for bot: ${botId}`);
    }
  }, []);

  // Event listeners
  const onBotStatusUpdate = useCallback((callback: (data: BotStatusUpdate) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-status-update', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-status-update', callback);
        }
      };
    }
  }, []);

  const onBotConnected = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-connected', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-connected', callback);
        }
      };
    }
  }, []);

  const onBotDisconnected = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-disconnected', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-disconnected', callback);
        }
      };
    }
  }, []);

  const onBotQrGenerated = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-qr-generated', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-qr-generated', callback);
        }
      };
    }
  }, []);

  const onBotError = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-error', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-error', callback);
        }
      };
    }
  }, []);

  const onMessageSent = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message-sent', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('message-sent', callback);
        }
      };
    }
  }, []);

  const onBotLog = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-log', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-log', callback);
        }
      };
    }
  }, []);

  const onBotStatsUpdate = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-stats-update', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-stats-update', callback);
        }
      };
    }
  }, []);

  // Additional events for database changes (when backend implements them)
  const onBotUpdated = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-updated', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-updated', callback);
        }
      };
    }
  }, []);

  const onBotCreated = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-created', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-created', callback);
        }
      };
    }
  }, []);

  const onBotDeleted = useCallback((callback: (data: BotEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bot-deleted', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bot-deleted', callback);
        }
      };
    }
  }, []);

  // Auto-connect when component mounts and user is authenticated
  useEffect(() => {
    const token = getToken();
    if (token && !socketRef.current && !isConnectingRef.current) {
      console.log('Auto-connecting WebSocket...');
      connect();
    }

    return () => {
      // Only disconnect on unmount, not on every effect run
    };
  }, []); // Remove all dependencies to prevent constant re-runs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebSocket connection...');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinBotRoom,
    leaveBotRoom,
    requestBotStatus,
    onBotStatusUpdate,
    onBotConnected,
    onBotDisconnected,
    onBotQrGenerated,
    onBotError,
    onMessageSent,
    onBotLog,
    onBotStatsUpdate,
    onBotUpdated,
    onBotCreated,
    onBotDeleted
  };
};