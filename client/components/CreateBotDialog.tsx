import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BotRequest } from '@shared/api';

interface CreateBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (botData: BotRequest) => Promise<void>;
  isCreating: boolean;
}

export default function CreateBotDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isCreating 
}: CreateBotDialogProps) {
  const [botForm, setBotForm] = useState<BotRequest>({
    name: '',
    description: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!botForm.name.trim() || !botForm.description.trim()) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    try {
      await onSubmit(botForm);
      // Reset form on success
      setBotForm({ name: '', description: '' });
    } catch (error) {
      setFormError('Error al crear el bot. Por favor, inténtalo de nuevo.');
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setBotForm({ name: '', description: '' });
      setFormError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={!isCreating ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Bot de WhatsApp</DialogTitle>
        </DialogHeader>
        
        {isCreating ? (
          /* Loading State */
          <div className="py-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Creando tu bot...</h3>
                <p className="text-sm text-gray-600 mb-1">Esto puede tomar unos momentos</p>
                <p className="text-xs text-gray-500">Configurando servicios de WhatsApp</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{formError}</AlertDescription>
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Bot *
              </label>
              <Input
                value={botForm.name}
                onChange={(e) => setBotForm({ ...botForm, name: e.target.value })}
                placeholder="Ej. Mi Bot de WhatsApp"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <Textarea
                value={botForm.description}
                onChange={(e) => setBotForm({ ...botForm, description: e.target.value })}
                placeholder="Ej. Bot para envío de mensajes automáticos a clientes"
                rows={3}
                required
              />
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-800 mb-1">📱 Proceso de configuración:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>El bot se creará en estado "pending"</li>
                <li>Luego podrás ver y escanear el código QR</li>
                <li>Una vez escaneado, tu bot estará activo</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
              >
                Crear Bot
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}