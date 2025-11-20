import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBots } from '@/hooks/useBots';
import { BotRequest, Message } from '@shared/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import CreateBotDialog from '@/components/CreateBotDialog';
import QRDialog from '@/components/QRDialog';
import BotCard from '@/components/BotCard';
import { 
  Plus, 
  MessageCircle, 
  Wifi, 
  WifiOff, 
  Settings, 
  Trash2, 
  QrCode, 
  Send, 
  History, 
  Bot,
  Smartphone,
  Globe,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Zap,
  Calendar,
  Users,
  TrendingUp,
  Phone,
  Shield,
  Database,
  Loader2,
  BookOpen,
  Copy
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
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
    deleteBot: deleteBotFn,
    isWebSocketConnected,
    activeBotRooms
  } = useBots();
  
  // Use the same API base URL for all requests and documentation
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showSendMessageDialog, setShowSendMessageDialog] = useState(false);
  const [showMessageHistoryDialog, setShowMessageHistoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false);
  const [documentationBot, setDocumentationBot] = useState<any>(null);
  const [showFullApiKey, setShowFullApiKey] = useState(false);
  const [configStep, setConfigStep] = useState(1);
  const [restartStep, setRestartStep] = useState(1);
  const [configBot, setConfigBot] = useState<any>(null);
  const [restartBotData, setRestartBotData] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [restartDialogLoading, setRestartDialogLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [restartDialogError, setRestartDialogError] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [restartingBots, setRestartingBots] = useState<Set<string>>(new Set());
  const [connectingBots, setConnectingBots] = useState<Set<string>>(new Set());
  const [restartError, setRestartError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [sendMessageBot, setSendMessageBot] = useState<any>(null);
  const [messageForm, setMessageForm] = useState({
    to: '',
    message: ''
  });
  const [sendMessageLoading, setSendMessageLoading] = useState(false);
  const [sendMessageError, setSendMessageError] = useState<string | null>(null);
  const [sendMessageSuccess, setSendMessageSuccess] = useState<string | null>(null);
  const [botToDelete, setBotToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [historyBot, setHistoryBot] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBots();
  }, []);

  const handleCreateBot = () => {
    setShowCreateDialog(true);
  };

  const handleCreateBotSubmit = async (botData: BotRequest) => {
    setIsCreating(true);

    try {
      const result = await createBot(botData);
      
      if (result.success) {
        setShowCreateDialog(false);
        fetchBots(); // Refrescar la lista
      } else {
        throw new Error(result.error || 'Error al crear el bot');
      }
    } catch (error) {
      throw error; // Re-throw para que el componente hijo maneje el error
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewQR = async (bot: any) => {
    setSelectedBot(bot);
    setQrCode(null);
    setQrError(null);
    setQrLoading(true);
    setShowQRDialog(true);

    const result = await getBotQR(bot._id);
    
    if (result.success && result.qrCode) {
      setQrCode(result.qrCode);
    } else {
      setQrError(result.error || 'Error al obtener el código QR');
    }
    
    setQrLoading(false);
  };

  const handleRetryQR = () => {
    if (selectedBot) {
      handleViewQR(selectedBot);
    }
  };

  const handleRestartBot = async (botId: string) => {
    setRestartingBots(prev => new Set(prev).add(botId));
    setRestartError(null);
    
    try {
      const result = await restartBot(botId);
      
      if (!result.success) {
        setRestartError(result.error || 'Error al reiniciar el bot');
      }
    } catch (error) {
      setRestartError('Error de conexión. Intenta nuevamente.');
    } finally {
      setRestartingBots(prev => {
        const newSet = new Set(prev);
        newSet.delete(botId);
        return newSet;
      });
    }
  };

  const handleConnectBot = async (botId: string) => {
    setConnectingBots(prev => new Set(prev).add(botId));
    setConnectError(null);
    
    try {
      const result = await connectBot(botId);
      
      if (!result.success) {
        setConnectError(result.error || 'Error al conectar el bot');
      }
    } catch (error) {
      setConnectError('Error de conexión. Intenta nuevamente.');
    } finally {
      setConnectingBots(prev => {
        const newSet = new Set(prev);
        newSet.delete(botId);
        return newSet;
      });
    }
  };

  const handleConfigureBot = (bot: any) => {
    setConfigBot(bot);
    setConfigStep(1);
    setConfigError(null);
    setQrCode(null);
    setShowConfigDialog(true);
  };

  const handleShowDocumentation = (bot: any) => {
    setDocumentationBot(bot);
    setShowFullApiKey(false); // Reset API key visibility when opening
    setShowDocumentationDialog(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Podrías agregar una notificación aquí si quieres
  };

  const getMaskedApiKey = (apiKey: string) => {
    if (!apiKey) return '';
    const visibleLength = Math.ceil(apiKey.length * 0.3); // Mostrar 30% del inicio
    const hiddenLength = apiKey.length - visibleLength;
    return apiKey.substring(0, visibleLength) + '•'.repeat(hiddenLength);
  };

  const handleApiKeyAction = () => {
    if (showFullApiKey) {
      // Si ya está visible, copiar
      copyToClipboard(documentationBot?.apiKey || '');
    } else {
      // Si está oculto, mostrar
      setShowFullApiKey(true);
    }
  };

  const handleConfigStep2 = async () => {
    if (!configBot) return;
    
    setConfigLoading(true);
    setConfigError(null);
    
    try {
      const result = await connectBot(configBot._id);
      
      if (result.success) {
        setConfigStep(3);
        // Esperar un poco y luego obtener el QR
        setTimeout(() => {
          handleConfigStep3();
        }, 2000);
      } else {
        setConfigError(result.error || 'Error al configurar el bot');
      }
    } catch (error) {
      setConfigError('Error de conexión. Intenta nuevamente.');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleConfigStep3 = async () => {
    if (!configBot) return;
    
    setQrLoading(true);
    setQrError(null);
    
    try {
      const result = await getBotQR(configBot._id);
      
      if (result.success && result.qrCode) {
        setQrCode(result.qrCode);
      } else {
        setQrError(result.error || 'Error al obtener el código QR');
      }
    } catch (error) {
      setQrError('Error de conexión. Intenta nuevamente.');
    } finally {
      setQrLoading(false);
    }
  };

  const handleCloseConfigDialog = () => {
    setShowConfigDialog(false);
    setConfigStep(1);
    setConfigBot(null);
    setConfigError(null);
    setQrCode(null);
    setQrError(null);
    // Refrescar la lista de bots
    fetchBots();
  };

  const handleRestartBotModal = (bot: any) => {
    setRestartBotData(bot);
    setRestartStep(1);
    setRestartDialogError(null);
    setQrCode(null);
    setShowRestartDialog(true);
  };

  const handleSendMessageModal = (bot: any) => {
    setSendMessageBot(bot);
    setMessageForm({
      to: '',
      message: ''
    });
    setSendMessageError(null);
    setSendMessageSuccess(null);
    setShowSendMessageDialog(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sendMessageBot || !messageForm.to.trim() || !messageForm.message.trim()) {
      setSendMessageError('El número y el mensaje son requeridos');
      return;
    }

    setSendMessageLoading(true);
    setSendMessageError(null);
    setSendMessageSuccess(null);

    try {
      const result = await sendTestMessage(sendMessageBot, {
        to: messageForm.to.trim(),
        message: messageForm.message.trim()
      });

      if (result.success) {
        setSendMessageSuccess('¡Mensaje enviado exitosamente!');
        setMessageForm({
          to: '',
          message: ''
        });
      } else {
        setSendMessageError(result.error || 'Error al enviar el mensaje');
      }
    } catch (error) {
      setSendMessageError('Error de conexión. Intenta nuevamente.');
    } finally {
      setSendMessageLoading(false);
    }
  };

  const handleViewMessageHistory = async (bot: any) => {
    setHistoryBot(bot);
    setMessages([]);
    setMessagesError(null);
    setCurrentPage(1);
    setShowMessageHistoryDialog(true);
    
    await loadMessages(bot._id, 1);
  };

  const loadMessages = async (botId: string, page: number) => {
    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const result = await getBotMessages(botId, page, 10);

      if (result.success && result.data) {
        setMessages(result.data.data);
        setCurrentPage(result.data.pagination.page);
        setTotalPages(result.data.pagination.pages);
      } else {
        setMessagesError(result.error || 'Error al cargar el historial');
      }
    } catch (error) {
      setMessagesError('Error de conexión. Intenta nuevamente.');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (historyBot && newPage >= 1 && newPage <= totalPages) {
      await loadMessages(historyBot._id, newPage);
    }
  };

  const handleDeleteBotModal = (bot: any) => {
    setBotToDelete(bot);
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const handleDeleteBot = async () => {
    if (!botToDelete) return;

    // Verificación adicional de seguridad
    if (botToDelete.status === 'connected') {
      setDeleteError('No se puede eliminar un bot conectado. Desconecta el bot primero.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const result = await deleteBotFn(botToDelete._id);

      if (result.success) {
        setShowDeleteDialog(false);
        setBotToDelete(null);
        // La lista se actualiza automáticamente por el fetchBots() en deleteBotFn
      } else {
        setDeleteError(result.error || 'Error al eliminar el bot');
      }
    } catch (error) {
      setDeleteError('Error de conexión. Intenta nuevamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestartStep2 = async () => {
    if (!restartBotData) return;
    
    setRestartDialogLoading(true);
    setRestartDialogError(null);
    
    try {
      const result = await restartBot(restartBotData._id);
      
      if (result.success) {
        setRestartStep(3);
        // Esperar un poco y luego obtener el QR
        setTimeout(() => {
          handleRestartStep3();
        }, 2000);
      } else {
        setRestartDialogError(result.error || 'Error al reiniciar el bot');
      }
    } catch (error) {
      setRestartDialogError('Error de conexión. Intenta nuevamente.');
    } finally {
      setRestartDialogLoading(false);
    }
  };

  const handleRestartStep3 = async () => {
    if (!restartBotData) return;
    
    setQrLoading(true);
    setQrError(null);
    
    try {
      const result = await getBotQR(restartBotData._id);
      
      if (result.success && result.qrCode) {
        setQrCode(result.qrCode);
      } else {
        setQrError(result.error || 'Error al obtener el código QR');
      }
    } catch (error) {
      setQrError('Error de conexión. Intenta nuevamente.');
    } finally {
      setQrLoading(false);
    }
  };

  const handleCloseRestartDialog = () => {
    setShowRestartDialog(false);
    setRestartStep(1);
    setRestartBotData(null);
    setRestartDialogError(null);
    setQrCode(null);
    setQrError(null);
    // Refrescar la lista de bots
    fetchBots();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Mis Bots</h1>
              <p className="text-sm text-gray-500 mt-1">Hola, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* WebSocket Connection Status */}
              <div className="flex items-center space-x-2">
                {isWebSocketConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm font-medium">En línea</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-medium">Desconectado</span>
                  </div>
                )}
                {activeBotRooms.size > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeBotRooms.size} bot{activeBotRooms.size !== 1 ? 's' : ''} activo{activeBotRooms.size !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total de Bots"
            value={isLoading ? '...' : bots.length}
            icon={Bot}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            title="Conectados"
            value={isLoading ? '...' : bots.filter(bot => bot.status === 'connected').length}
            icon={Wifi}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            valueColor="text-green-600"
          />
          <StatsCard
            title="Pendientes"
            value={isLoading ? '...' : bots.filter(bot => bot.status === 'pending').length}
            icon={Clock}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            valueColor="text-purple-600"
          />
          <StatsCard
            title="Desconectados"
            value={isLoading ? '...' : bots.filter(bot => bot.status === 'disconnected').length}
            icon={WifiOff}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
            valueColor="text-red-600"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Restart Error Alert */}
        {restartError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{restartError}</AlertDescription>
          </Alert>
        )}

        {/* Connect Error Alert */}
        {connectError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{connectError}</AlertDescription>
          </Alert>
        )}

        {/* Bots List */}
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-gray-600">Cargando bots...</div>
          </div>
        ) : bots.length === 0 ? (
          /* Empty State */
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay bots aún</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Crea tu primer bot de WhatsApp para comenzar a interactuar con tus clientes</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleCreateBot}
            >
              Crear Nuevo Bot
            </Button>
          </div>
        ) : (
          /* Bots Grid */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Mis Bots de WhatsApp</h3>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleCreateBot}
              >
                Crear Nuevo Bot
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <BotCard
                  key={bot._id}
                  bot={bot}
                  restartingBots={restartingBots}
                  connectingBots={connectingBots}
                  onViewQR={handleViewQR}
                  onConfigure={handleConfigureBot}
                  onRestart={handleRestartBotModal}
                  onSendMessage={handleSendMessageModal}
                  onViewHistory={handleViewMessageHistory}
                  onDelete={handleDeleteBotModal}
                  onShowDocumentation={handleShowDocumentation}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Bot Dialog */}
      <CreateBotDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateBotSubmit}
        isCreating={isCreating}
      />

      {/* QR Code Dialog */}
      <QRDialog 
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        bot={selectedBot}
        qrCode={qrCode}
        loading={qrLoading}
        error={qrError}
        onRetry={handleRetryQR}
      />

      {/* Configuration Dialog with 3 Steps */}
      <Dialog open={showConfigDialog} onOpenChange={!configLoading ? handleCloseConfigDialog : undefined}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Bot - {configBot?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${configStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-12 h-1 ${configStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${configStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-12 h-1 ${configStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${configStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>

            {/* Step 1: Reminder */}
            {configStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ten tu celular listo</h3>
                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-blue-800 mb-2">📱 Antes de continuar, asegúrate de tener:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                    <li>Tu teléfono con WhatsApp instalado</li>
                    <li>Acceso a la cámara para escanear el código QR</li>
                    <li>Conexión a internet estable</li>
                    <li>Permisos para vincular dispositivos en WhatsApp</li>
                  </ul>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseConfigDialog}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => setConfigStep(2)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Initialize Connection */}
            {configStep === 2 && (
              <div className="text-center space-y-4">
                {configLoading ? (
                  <div className="py-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Inicializando conexión...</h3>
                        <p className="text-sm text-gray-600">Configurando tu bot de WhatsApp</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Inicializar conexión</h3>
                    <p className="text-gray-600">
                      Ahora vamos a inicializar la conexión con WhatsApp para generar tu código QR.
                    </p>
                    
                    {configError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">{configError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setConfigStep(1)}
                        disabled={configLoading}
                      >
                        Atrás
                      </Button>
                      <Button 
                        onClick={handleConfigStep2}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={configLoading}
                      >
                        Inicializar Conexión
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: QR Code Display */}
            {configStep === 3 && (
              <div className="space-y-4">
                {qrLoading ? (
                  <div className="py-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Generando código QR...</h3>
                        <p className="text-sm text-gray-600">Preparando la conexión con WhatsApp</p>
                      </div>
                    </div>
                  </div>
                ) : qrError ? (
                  <div className="py-8">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{qrError}</AlertDescription>
                    </Alert>
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleConfigStep3}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Reintentar
                      </Button>
                    </div>
                  </div>
                ) : qrCode ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Escanea el código QR</h3>
                      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                        <img 
                          src={qrCode} 
                          alt="Código QR de WhatsApp" 
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">📱 Instrucciones:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-green-700 text-sm">
                        <li>Abre WhatsApp en tu teléfono</li>
                        <li>Ve a Configuración → Dispositivos vinculados</li>
                        <li>Toca "Vincular un dispositivo"</li>
                        <li>Escanea este código QR con tu teléfono</li>
                        <li>Una vez confirmado, cierra este modal</li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>Nota:</strong> Una vez que confirmes la conexión en tu teléfono, puedes cerrar este modal. 
                        Tu bot aparecerá como "Conectado" en la lista.
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleConfigStep3}
                      >
                        Actualizar QR
                      </Button>
                      <Button 
                        onClick={handleCloseConfigDialog}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Restart Dialog with 3 Steps */}
      <Dialog open={showRestartDialog} onOpenChange={!restartDialogLoading ? handleCloseRestartDialog : undefined}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reiniciar Bot - {restartBotData?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${restartStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-12 h-1 ${restartStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${restartStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-12 h-1 ${restartStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${restartStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>

            {/* Step 1: Reminder */}
            {restartStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Preparar reconexión</h3>
                <div className="bg-orange-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-orange-800 mb-2">🔄 Antes de reiniciar, ten en cuenta:</h4>
                  <ul className="list-disc list-inside space-y-1 text-orange-700 text-sm">
                    <li>Tu bot se desconectará temporalmente</li>
                    <li>Necesitarás tu teléfono para re-escanear el QR</li>
                    <li>La reconexión puede tomar unos minutos</li>
                    <li>Los mensajes pendientes se mantendrán</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Importante:</strong> Solo reinicia si tu bot está experimentando problemas de conexión.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseRestartDialog}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => setRestartStep(2)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Restart Connection */}
            {restartStep === 2 && (
              <div className="text-center space-y-4">
                {restartDialogLoading ? (
                  <div className="py-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Reiniciando conexión...</h3>
                        <p className="text-sm text-gray-600">Restableciendo la conexión con WhatsApp</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Reiniciar conexión</h3>
                    <p className="text-gray-600">
                      Vamos a reiniciar la conexión de tu bot con WhatsApp para restablecer la comunicación.
                    </p>
                    
                    {restartDialogError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">{restartDialogError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setRestartStep(1)}
                        disabled={restartDialogLoading}
                      >
                        Atrás
                      </Button>
                      <Button 
                        onClick={handleRestartStep2}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={restartDialogLoading}
                      >
                        Reiniciar Conexión
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: QR Code Display */}
            {restartStep === 3 && (
              <div className="space-y-4">
                {qrLoading ? (
                  <div className="py-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Generando nuevo código QR...</h3>
                        <p className="text-sm text-gray-600">Preparando la reconexión con WhatsApp</p>
                      </div>
                    </div>
                  </div>
                ) : qrError ? (
                  <div className="py-8">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{qrError}</AlertDescription>
                    </Alert>
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleRestartStep3}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Reintentar
                      </Button>
                    </div>
                  </div>
                ) : qrCode ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Re-escanea el código QR</h3>
                      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                        <img 
                          src={qrCode} 
                          alt="Código QR de WhatsApp" 
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">📱 Instrucciones de reconexión:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-green-700 text-sm">
                        <li>Abre WhatsApp en tu teléfono</li>
                        <li>Ve a Configuración → Dispositivos vinculados</li>
                        <li>Busca tu bot desconectado y eliminalo</li>
                        <li>Toca "Vincular un dispositivo"</li>
                        <li>Escanea este nuevo código QR</li>
                        <li>Una vez confirmado, cierra este modal</li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>Nota:</strong> Una vez que confirmes la reconexión en tu teléfono, puedes cerrar este modal. 
                        Tu bot aparecerá como "Conectado" nuevamente.
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleRestartStep3}
                      >
                        Actualizar QR
                      </Button>
                      <Button 
                        onClick={handleCloseRestartDialog}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showSendMessageDialog} onOpenChange={setShowSendMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Probar Envío - {sendMessageBot?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de teléfono
                </label>
                <Input
                  id="phoneNumber"
                  type="text"
                  placeholder="Ej: 51955768897"
                  value={messageForm.to}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, to: e.target.value }))}
                  disabled={sendMessageLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Incluye código de país sin el símbolo +
                </p>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <Textarea
                  id="message"
                  placeholder="Escribe tu mensaje de prueba aquí..."
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  disabled={sendMessageLoading}
                  rows={4}
                />
              </div>

              {sendMessageError && (
                <Alert>
                  <AlertDescription className="text-red-700">{sendMessageError}</AlertDescription>
                </Alert>
              )}

              {sendMessageSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{sendMessageSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSendMessageDialog(false)}
                  disabled={sendMessageLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={sendMessageLoading || !messageForm.to.trim() || !messageForm.message.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sendMessageLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Mensaje'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message History Dialog */}
      <Dialog open={showMessageHistoryDialog} onOpenChange={setShowMessageHistoryDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Historial de Mensajes - {historyBot?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {messagesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : messagesError ? (
              <Alert>
                <AlertDescription className="text-red-700">{messagesError}</AlertDescription>
              </Alert>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron mensajes para este bot
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div 
                    key={message._id} 
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Para: {message.to}</span>
                        <Badge 
                          variant={message.status === 'sent' ? 'default' : message.status === 'failed' ? 'destructive' : 'secondary'}
                          className={message.status === 'sent' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {message.status === 'sent' ? 'Enviado' : message.status === 'failed' ? 'Fallido' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                    
                    {message.messageId && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <strong>ID:</strong> {message.messageId}
                      </div>
                    )}
                    
                    {message.error && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                        <strong>Error:</strong> {message.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || messagesLoading}
                >
                  Anterior
                </Button>
                
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || messagesLoading}
                >
                  Siguiente
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowMessageHistoryDialog(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar el bot <strong>"{botToDelete?.name}"</strong>?
              </p>
              
              {botToDelete?.status && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Estado actual:</strong> {
                      botToDelete.status === 'pending' ? 'Pendiente' :
                      botToDelete.status === 'connected' ? 'Conectado' :
                      botToDelete.status === 'disconnected' ? 'Desconectado' : 
                      botToDelete.status
                    }
                  </p>
                </div>
              )}
              
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. 
                  Se eliminarán todos los datos del bot incluyendo configuración y historial.
                </p>
              </div>
            </div>

            {deleteError && (
              <Alert>
                <AlertDescription className="text-red-700">{deleteError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteBot}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Bot'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documentation Dialog */}
      <Dialog open={showDocumentationDialog} onOpenChange={setShowDocumentationDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Documentación API - {documentationBot?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Endpoint Information */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📡 Endpoint de Envío</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700 font-medium">URL:</span>
                    <code className="bg-white px-3 py-1 rounded border text-sm font-mono">{apiBaseUrl}/api/bots/{documentationBot?._id}/send</code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(`${apiBaseUrl}/api/bots/${documentationBot?._id}/send`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700 font-medium">Método:</span>
                    <code className="bg-white px-3 py-1 rounded border text-sm font-mono">POST</code>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">🔐 Autenticación</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-amber-700 font-medium">API Key:</span>
                    <code className="bg-white px-3 py-1 rounded border text-sm font-mono break-all">
                      {showFullApiKey ? documentationBot?.apiKey : getMaskedApiKey(documentationBot?.apiKey || '')}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleApiKeyAction}
                      className="flex items-center gap-1"
                    >
                      {showFullApiKey ? (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Mostrar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-amber-700">
                    Incluye este API Key en el header <code className="bg-white px-1 rounded">API_KEY: {showFullApiKey ? documentationBot?.apiKey : getMaskedApiKey(documentationBot?.apiKey || '')}</code>
                  </p>
                </div>
              </div>

              {/* Request Format */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-3">📝 Formato de Petición</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-green-700 font-medium">Content-Type:</span>
                    <code className="bg-white px-3 py-1 rounded border text-sm font-mono ml-2">application/json</code>
                  </div>
                  <div>
                    <span className="text-sm text-green-700 font-medium">Body (JSON):</span>
                    <pre className="bg-white p-3 rounded border text-sm font-mono mt-2 overflow-x-auto">
{`{
  "to": "51955768897",
  "message": "¡Hola! Este es un mensaje desde mi aplicación."
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Example Code */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💻 Ejemplo de Código</h3>
                
                {/* JavaScript/Fetch Example */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">JavaScript (Fetch)</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`fetch('${apiBaseUrl}/api/bots/${documentationBot?._id}/send', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'API_KEY': '${showFullApiKey ? documentationBot?.apiKey : getMaskedApiKey(documentationBot?.apiKey || '')}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '51955768897',
    message: '¡Hola desde mi app!'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`fetch('${apiBaseUrl}/api/bots/${documentationBot?._id}/send', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'API_KEY': '${documentationBot?.apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '51955768897',
    message: '¡Hola desde mi app!'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`)}
                      disabled={!showFullApiKey}
                      title={!showFullApiKey ? "Primero muestra el API Key completo" : "Copiar código"}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* cURL Example */}
                <div className="space-y-3 mt-6">
                  <h4 className="font-medium text-gray-800">cURL</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`curl -X POST "${apiBaseUrl}/api/bots/${documentationBot?._id}/send" \\
  -H "accept: application/json" \\
  -H "API_KEY: ${showFullApiKey ? documentationBot?.apiKey : getMaskedApiKey(documentationBot?.apiKey || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "51955768897",
    "message": "¡Hola desde cURL!"
  }'`}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`curl -X POST "${apiBaseUrl}/api/bots/${documentationBot?._id}/send" \\
  -H "accept: application/json" \\
  -H "API_KEY: ${documentationBot?.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "51955768897",
    "message": "¡Hola desde cURL!"
  }'`)}
                      disabled={!showFullApiKey}
                      title={!showFullApiKey ? "Primero muestra el API Key completo" : "Copiar código"}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Python Example */}
                <div className="space-y-3 mt-6">
                  <h4 className="font-medium text-gray-800">Python (requests)</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import requests

url = "${apiBaseUrl}/api/bots/${documentationBot?._id}/send"
headers = {
    "accept": "application/json",
    "API_KEY": "${showFullApiKey ? documentationBot?.apiKey : getMaskedApiKey(documentationBot?.apiKey || '')}",
    "Content-Type": "application/json"
}
data = {
    "to": "51955768897",
    "message": "¡Hola desde Python!"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`import requests

url = "${apiBaseUrl}/api/bots/${documentationBot?._id}/send"
headers = {
    "accept": "application/json",
    "API_KEY": "${documentationBot?.apiKey}",
    "Content-Type": "application/json"
}
data = {
    "to": "51955768897",
    "message": "¡Hola desde Python!"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`)}
                      disabled={!showFullApiKey}
                      title={!showFullApiKey ? "Primero muestra el API Key completo" : "Copiar código"}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Response Format */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">📤 Formato de Respuesta</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-purple-700 font-medium">Respuesta Exitosa (200):</span>
                    <pre className="bg-white p-3 rounded border text-sm font-mono mt-2 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "messageId": "true_51955768897@c.us_3EB0947E7067D64037AB39_out",
    "message": "Mensaje enviado exitosamente",
    "timestamp": "2025-10-31T02:36:06.113Z",
    "bot": {
      "id": "69042068f78b4a401d364c5b",
      "name": "Gonza Bot",
      "phoneNumber": "+51955768897"
    },
    "recipient": "51955768897",
    "sentAt": "2025-10-31T02:36:06.113Z"
  }
}`}
                    </pre>
                  </div>
                  <div>
                    <span className="text-sm text-purple-700 font-medium">Respuesta de Error (400/500):</span>
                    <pre className="bg-white p-3 rounded border text-sm font-mono mt-2 overflow-x-auto">
{`{
  "success": false,
  "error": "Descripción del error"
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Notas Importantes</h3>
                <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                  <li>El campo <code>to</code> debe incluir el código de país sin el símbolo + (ej: 51955768897)</li>
                  <li>El bot debe estar en estado "Conectado" para enviar mensajes</li>
                  <li>Mantén tu token seguro y nunca lo expongas en código del frontend</li>
                  <li>Los mensajes pueden tardar unos segundos en ser entregados</li>
                  <li>Respeta los límites de WhatsApp para evitar restricciones</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={() => setShowDocumentationDialog(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
