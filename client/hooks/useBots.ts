import { useState, useEffect, useCallback } from 'react';
import { BotsListResponse, BotResponse, BotRequest, Bot, SendMessageRequest, SendMessageResponse, MessagesResponse } from '@shared/api';
import { useAuth } from './useAuth';
import { useWebSocket, BotStatusUpdate } from './useWebSocket';
import { API_ENDPOINTS } from '@/config/api';

export const useBots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBotRooms, setActiveBotRooms] = useState<Set<string>>(new Set());
  const [lastDataRefresh, setLastDataRefresh] = useState<Date>(new Date());
  const { getToken } = useAuth();
  const {
    isConnected,
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
  } = useWebSocket();

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Update bot status from WebSocket events
  const updateBotStatus = useCallback((statusUpdate: BotStatusUpdate) => {
    setBots(prevBots =>
      prevBots.map(bot =>
        bot._id === statusUpdate.botId
          ? {
              ...bot,
              status: statusUpdate.database.status as 'pending' | 'connected' | 'disconnected' | 'error',
              phoneNumber: statusUpdate.database.phoneNumber || bot.phoneNumber,
              lastActivity: statusUpdate.database.lastActivity,
              qrCode: statusUpdate.database.qrCode ? 'available' : null,
              isReady: statusUpdate.isReady,
              realTime: statusUpdate.realTime
            }
          : bot
      )
    );
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    const cleanupFunctions: (() => void)[] = [];

    // Bot status updates
    cleanupFunctions.push(
      onBotStatusUpdate((data) => {
        console.log('Bot status update received:', data);
        updateBotStatus(data);
      })
    );

    // Bot connected
    cleanupFunctions.push(
      onBotConnected((data) => {
        console.log('Bot connected:', data);
        // Request updated status and refresh bot data from database
        requestBotStatus(data.botId);
        // Small delay to ensure database is updated, then refresh
        setTimeout(() => {
          fetchBots();
        }, 1000);
      })
    );

    // Bot disconnected
    cleanupFunctions.push(
      onBotDisconnected((data) => {
        console.log('Bot disconnected:', data);
        // Update bot status to disconnected
        setBots(prevBots =>
          prevBots.map(bot =>
            bot._id === data.botId
              ? { ...bot, status: 'disconnected', isReady: false }
              : bot
          )
        );
        // Refresh to get latest database state
        setTimeout(() => {
          fetchBots();
        }, 500);
      })
    );

    // QR Code generated
    cleanupFunctions.push(
      onBotQrGenerated((data) => {
        console.log('QR generated:', data);
        // Update bot to indicate QR is available
        setBots(prevBots =>
          prevBots.map(bot =>
            bot._id === data.botId
              ? { ...bot, qrCode: 'available' }
              : bot
          )
        );
      })
    );

    // Bot error
    cleanupFunctions.push(
      onBotError((data) => {
        console.error('Bot error:', data);
        // Could show toast notification here
      })
    );

    // Message sent
    cleanupFunctions.push(
      onMessageSent((data) => {
        console.log('Message sent:', data);
        // Could update message count or show success notification
      })
    );

    // Bot log
    cleanupFunctions.push(
      onBotLog((data) => {
        console.log('Bot log:', data);
        // Could add to debug logs
      })
    );

    // Bot stats update
    cleanupFunctions.push(
      onBotStatsUpdate((data) => {
        console.log('Bot stats update:', data);
        // Could update statistics display
      })
    );

    // Database change events (when backend implements them)
    cleanupFunctions.push(
      onBotUpdated((data) => {
        console.log('Bot updated in database:', data);
        // Force refresh data from database
        setTimeout(() => forceRefreshData(), 500);
      })
    );

    cleanupFunctions.push(
      onBotCreated((data) => {
        console.log('New bot created:', data);
        // Refresh bot list to include new bot
        setTimeout(() => forceRefreshData(), 500);
      })
    );

    cleanupFunctions.push(
      onBotDeleted((data) => {
        console.log('Bot deleted:', data);
        // Remove bot from local state and leave room
        setBots(prevBots => prevBots.filter(bot => bot._id !== data.botId));
        if (activeBotRooms.has(data.botId)) {
          leaveBotRoom(data.botId);
          setActiveBotRooms(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.botId);
            return newSet;
          });
        }
      })
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [
    isConnected,
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
    onBotDeleted,
    updateBotStatus,
    requestBotStatus
  ]);

  const fetchBots = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.BOTS, {
        headers: getAuthHeaders()
      });

      const data: BotsListResponse = await response.json();

      if (data.success) {
        // Merge database data with current real-time state
        setBots(prevBots => {
          const mergedBots = data.data.map(dbBot => {
            // Find existing bot in current state to preserve real-time data
            const existingBot = prevBots.find(bot => bot._id === dbBot._id);

            if (existingBot) {
              // Merge: keep database data as source of truth, but preserve real-time additions
              return {
                ...dbBot, // Database data (source of truth)
                // Preserve real-time data that might not be in DB yet
                realTime: existingBot.realTime || dbBot.realTime,
                // Keep any additional real-time properties
                isReady: existingBot.isReady !== undefined ? existingBot.isReady : dbBot.isReady
              };
            }

            return dbBot; // New bot from database
          });

          return mergedBots;
        });

        // Update last refresh timestamp
        setLastDataRefresh(new Date());

        // Join WebSocket rooms for active bots
        if (isConnected) {
          data.data.forEach(bot => {
            if (bot.isActive && !activeBotRooms.has(bot._id)) {
              joinBotRoom(bot._id);
              setActiveBotRooms(prev => new Set(prev).add(bot._id));
            }
          });
        }
      } else {
        setError(data.message || 'Failed to fetch bots');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch bots error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createBot = async (botData: BotRequest): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.BOTS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(botData)
      });

      const data: BotResponse = await response.json();

      if (data.success) {
        await fetchBots(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to create bot' };
      }
    } catch (err) {
      console.error('Create bot error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const getBotQR = async (botId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.BOT_QR_PUBLIC(botId), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        // El endpoint puede devolver la imagen directamente o un JSON con la URL
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('image')) {
          // Si devuelve la imagen directamente
          const blob = await response.blob();
          const qrCode = URL.createObjectURL(blob);
          return { success: true, qrCode };
        } else {
          // Si devuelve JSON con la URL/base64
          const data = await response.json();
          return { success: true, qrCode: data.qrCode || data.data };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || 'Failed to get QR code' };
      }
    } catch (err) {
      console.error('Get QR error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const restartBot = async (botId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.BOT_RESTART(botId), {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        await fetchBots(); // Refresh the list to get updated status
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to restart bot' };
      }
    } catch (err) {
      console.error('Restart bot error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const connectBot = async (botId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.BOT_CONNECT(botId), {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        await fetchBots(); // Refresh the list to get updated status
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to connect bot' };
      }
    } catch (err) {
      console.error('Connect bot error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const sendTestMessage = async (bot: Bot, messageData: SendMessageRequest): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      const response = await fetch(API_ENDPOINTS.BOT_SEND_MESSAGE(bot._id), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'API_KEY': bot.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      const data: SendMessageResponse = await response.json();

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to send message' };
      }
    } catch (err) {
      console.error('Send message error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const getBotMessages = async (botId: string, page: number = 1, limit: number = 10): Promise<{ success: boolean; error?: string; data?: MessagesResponse }> => {
    try {
      const url = `${API_ENDPOINTS.BOT_MESSAGES(botId)}?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      const data: MessagesResponse = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to get message history' };
      }
    } catch (err) {
      console.error('Get messages error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const deleteBot = async (botId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.BOT_BY_ID(botId), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        // Leave WebSocket room for deleted bot
        if (activeBotRooms.has(botId)) {
          leaveBotRoom(botId);
          setActiveBotRooms(prev => {
            const newSet = new Set(prev);
            newSet.delete(botId);
            return newSet;
          });
        }
        
        await fetchBots(); // Refresh the list after deletion
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to delete bot' };
      }
    } catch (err) {
      console.error('Delete bot error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // WebSocket room management
  const joinBotRoomManual = useCallback((botId: string) => {
    if (isConnected && !activeBotRooms.has(botId)) {
      joinBotRoom(botId);
      setActiveBotRooms(prev => new Set(prev).add(botId));
    }
  }, [isConnected, activeBotRooms, joinBotRoom]);

  const leaveBotRoomManual = useCallback((botId: string) => {
    if (activeBotRooms.has(botId)) {
      leaveBotRoom(botId);
      setActiveBotRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(botId);
        return newSet;
      });
    }
  }, [activeBotRooms, leaveBotRoom]);

  // Force refresh data from database
  const forceRefreshData = useCallback(async () => {
    console.log('Forcing data refresh from database...');
    await fetchBots();
  }, [fetchBots]);

  // Smart polling: refresh data periodically when WebSocket is connected
  // but only if no recent activity (fallback for missing backend events)
  useEffect(() => {
    if (!isConnected) return;

    const pollInterval = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastDataRefresh.getTime();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes

      // Only poll if it's been more than 5 minutes since last refresh
      // and we haven't received any WebSocket events recently
      if (timeSinceLastRefresh > fiveMinutes) {
        console.log('Smart polling: refreshing data from database (fallback)');
        fetchBots();
      }
    }, 60000); // Check every minute

    return () => clearInterval(pollInterval);
  }, [isConnected, lastDataRefresh, fetchBots]);

  return {
    bots,
    isLoading,
    error,
    fetchBots,
    createBot,
    getBotQR,
    restartBot,
    connectBot,
    sendTestMessage,
    getBotMessages,
    deleteBot,
    // WebSocket related
    isWebSocketConnected: isConnected,
    activeBotRooms,
    joinBotRoomManual,
    leaveBotRoomManual,
    forceRefreshData,
    lastDataRefresh
  };
};