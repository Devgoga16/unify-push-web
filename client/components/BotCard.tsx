import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Settings, 
  Trash2, 
  QrCode, 
  Send, 
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Wifi
} from 'lucide-react';

interface BotCardProps {
  bot: any;
  restartingBots: Set<string>;
  connectingBots: Set<string>;
  onViewQR: (bot: any) => void;
  onConfigure: (bot: any) => void;
  onRestart: (bot: any) => void;
  onSendMessage: (bot: any) => void;
  onViewHistory: (bot: any) => void;
  onDelete: (bot: any) => void;
  onShowDocumentation: (bot: any) => void;
}

export default function BotCard({ 
  bot, 
  restartingBots, 
  connectingBots,
  onViewQR,
  onConfigure,
  onRestart,
  onSendMessage,
  onViewHistory,
  onDelete,
  onShowDocumentation
}: BotCardProps) {
  const getStatusBadge = () => {
    if (restartingBots.has(bot._id)) {
      return { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Reiniciando' };
    }
    if (connectingBots.has(bot._id)) {
      return { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200', text: !bot.qrCode ? 'Configurando' : 'Conectando' };
    }
    
    switch (bot.status) {
      case 'connected':
        return { variant: 'default' as const, className: '', text: 'Conectado' };
      case 'pending':
        if (bot.qrCode) {
          return { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Configurado' };
        } else {
          return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Creado' };
        }
      case 'disconnected':
        return { variant: 'secondary' as const, className: '', text: 'Desconectado' };
      case 'error':
        return { variant: 'destructive' as const, className: '', text: 'Error' };
      default:
        return { variant: 'secondary' as const, className: '', text: 'Desconocido' };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{bot.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{bot.description}</p>
        </div>
        <Badge variant={status.variant} className={status.className}>
          {status.text}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>API Key: {bot.apiKey.substring(0, 20)}...</span>
        <span>{new Date(bot.lastActivity).toLocaleDateString()}</span>
      </div>
      
      {/* Estado del bot */}
      {bot.status === 'pending' && !bot.qrCode && !connectingBots.has(bot._id) && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Bot creado</p>
              <p className="text-sm text-gray-700">El bot ha sido creado. Haz clic en "Configurar" para inicializar la conexión con WhatsApp.</p>
            </div>
          </div>
        </div>
      )}

      {bot.status === 'pending' && bot.qrCode && !connectingBots.has(bot._id) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <QrCode className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Bot configurado</p>
              <p className="text-sm text-yellow-700">El código QR está listo. Escanéalo con WhatsApp para completar la conexión.</p>
            </div>
          </div>
        </div>
      )}

      {restartingBots.has(bot._id) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mt-0.5 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">Reiniciando bot</p>
              <p className="text-sm text-blue-700">Reiniciando la conexión de WhatsApp. Esto puede tomar unos momentos.</p>
            </div>
          </div>
        </div>
      )}

      {connectingBots.has(bot._id) && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mt-0.5 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-green-800">
                {!bot.qrCode ? 'Configurando bot' : 'Conectando bot'}
              </p>
              <p className="text-sm text-green-700">
                {!bot.qrCode 
                  ? 'Inicializando la conexión con WhatsApp. El QR estará disponible en unos segundos.'
                  : 'Finalizando la conexión con WhatsApp.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {bot.status === 'connected' && bot.phoneNumber && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Conectado:</span>
          <span className="text-sm font-mono text-green-700">{bot.phoneNumber}</span>
        </div>
      )}

      {/* Estado en tiempo real */}
      {bot.realTime && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Wifi className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 mb-2">Estado en tiempo real</p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Cliente WhatsApp:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${bot.realTime.clientExists ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${bot.realTime.clientExists ? 'text-green-700' : 'text-red-700'}`}>
                      {bot.realTime.clientExists ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Código QR:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${bot.realTime.hasQR ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`font-medium ${bot.realTime.hasQR ? 'text-green-700' : 'text-gray-600'}`}>
                      {bot.realTime.hasQR ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-blue-200">
                  <span className="text-blue-700 font-medium">Listo para enviar:</span>
                  <span className={`font-bold text-sm ${bot.realTime.isReady ? 'text-green-700' : 'text-red-700'}`}>
                    {bot.realTime.isReady ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de preparación general */}
      {bot.isReady !== undefined && (
        <div className={`mb-4 p-2 rounded-lg text-center text-sm font-medium ${
          bot.isReady
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {bot.isReady ? '🚀 Bot listo para usar' : '⏳ Bot no está listo'}
        </div>
      )}
      
      <div className="flex justify-center gap-2">
        {/* Bot Creado: status="pending" && qrCode=null */}
        {bot.status === 'pending' && !bot.qrCode && !connectingBots.has(bot._id) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 flex items-center gap-2"
            onClick={() => onConfigure(bot)}
          >
            <Settings className="w-4 h-4" />
            Configurar
          </Button>
        )}

        {/* Bot Configurado: status="pending" && qrCode exists */}
        {bot.status === 'pending' && bot.qrCode && !connectingBots.has(bot._id) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            onClick={() => onViewQR(bot)}
          >
            <QrCode className="w-4 h-4 mr-1" />
            Ver QR
          </Button>
        )}

        {/* Estado Conectando */}
        {connectingBots.has(bot._id) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 hover:text-green-700 flex items-center gap-2"
            disabled={true}
          >
            <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            {!bot.qrCode ? 'Configurando...' : 'Conectando...'}
          </Button>
        )}

        {/* Bot Desconectado */}
        {bot.status === 'disconnected' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            onClick={() => onRestart(bot)}
          >
            <RotateCcw className="w-4 h-4" />
            Reconectar
          </Button>
        )}

        {/* Estado Reiniciando */}
        {restartingBots.has(bot._id) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            disabled={true}
          >
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            Reiniciando...
          </Button>
        )}

        {/* Bot Conectado - Botones de acción */}
        {bot.status === 'connected' && !restartingBots.has(bot._id) && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              onClick={() => onSendMessage(bot)}
            >
              <Send className="w-4 h-4 mr-1" />
              Enviar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
              onClick={() => onViewHistory(bot)}
            >
              <History className="w-4 h-4 mr-1" />
              Historial
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={() => onShowDocumentation(bot)}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              API
            </Button>
          </>
        )}

        {/* Botón eliminar - siempre visible */}
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={() => onDelete(bot)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}