import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: any | null;
  qrCode: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function QRDialog({ 
  open, 
  onOpenChange, 
  bot, 
  qrCode, 
  loading, 
  error, 
  onRetry 
}: QRDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Código QR - {bot?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            /* Loading QR */
            <div className="py-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Obteniendo código QR...</h3>
                  <p className="text-sm text-gray-600">Preparando la conexión con WhatsApp</p>
                </div>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="py-8">
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={onRetry}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : qrCode ? (
            /* QR Display */
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                  <img 
                    src={qrCode} 
                    alt="Código QR de WhatsApp" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📱 Instrucciones:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                  <li>Abre WhatsApp en tu teléfono</li>
                  <li>Ve a Configuración → Dispositivos vinculados</li>
                  <li>Toca "Vincular un dispositivo"</li>
                  <li>Escanea este código QR con tu teléfono</li>
                  <li>¡Tu bot estará conectado y listo para usar!</li>
                </ol>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>Nota:</strong> Este código QR expira en unos minutos. Si no funciona, cierra este modal y vuelve a hacer clic en "Ver QR".
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={onRetry}
                >
                  Actualizar QR
                </Button>
                <Button 
                  onClick={() => onOpenChange(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}