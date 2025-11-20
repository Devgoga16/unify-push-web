# WebSocket API - Documentación para Frontend React

## 🚀 **WebSocket Implementation Completada**

La API ahora incluye **WebSockets en tiempo real** para actualizar el estado de los bots automáticamente en tu frontend React.

## 📋 **Características Implementadas**

✅ **Socket.IO Server** integrado en el backend
✅ **Autenticación JWT** para conexiones WebSocket
✅ **Rooms específicas** por bot para actualizaciones dirigidas
✅ **Eventos en tiempo real** para todos los cambios de estado
✅ **Endpoint de estadísticas** para debugging
✅ **Sincronización automática** en listados de bots

---

## 🔧 **Instalación en React**

```bash
npm install socket.io-client
```

## 📱 **Uso en React**

### 1. **Conectar al WebSocket**

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'tu-jwt-token-aqui' // Token JWT del usuario autenticado
  }
});
```

### 2. **Unirse a Room de Bot**

```javascript
// Unirse a actualizaciones de un bot específico
socket.emit('join-bot-room', '69050008605fde1e00be6704');

// Salir de la room
socket.emit('leave-bot-room', '69050008605fde1e00be6704');
```

### 3. **Solicitar Estado Actual**

```javascript
// Solicitar estado actual del bot
socket.emit('request-bot-status', '69050008605fde1e00be6704');
```

### 4. **Escuchar Eventos**

```javascript
// Estado del bot actualizado (se emite automáticamente al:
// - Obtener listado de bots
// - Obtener bot individual
// - Cambios en tiempo real del bot)
socket.on('bot-status-update', (data) => {
  console.log('Estado del bot actualizado:', data);
  /*
  data = {
    botId: '69050008605fde1e00be6704',
    database: {
      status: 'connected',
      phoneNumber: '+51966384230',
      lastActivity: '2025-10-31T18:30:17.343Z',
      qrCode: false
    },
    realTime: {
      clientExists: true,
      hasQR: false,
      isReady: true
    },
    isReady: true,
    timestamp: '2025-10-31T18:31:34.000Z'
  }
  */
});

// QR Code generado
socket.on('bot-qr-generated', (data) => {
  console.log('QR generado:', data);
  // Mostrar QR para que el usuario lo escanee
});

// Bot conectado exitosamente
socket.on('bot-connected', (data) => {
  console.log('Bot conectado:', data);
  // Actualizar UI - mostrar como conectado
});

// Bot desconectado
socket.on('bot-disconnected', (data) => {
  console.log('Bot desconectado:', data);
  // Actualizar UI - mostrar como desconectado
});

// Error en bot
socket.on('bot-error', (data) => {
  console.log('Error en bot:', data);
  // Mostrar notificación de error
});

// Mensaje enviado
socket.on('message-sent', (data) => {
  console.log('Mensaje enviado:', data);
  // Actualizar lista de mensajes
});

// Log de actividad
socket.on('bot-log', (data) => {
  console.log('Log del bot:', data);
  // Mostrar en consola de debug o logs
});

// Estadísticas actualizadas
socket.on('bot-stats-update', (data) => {
  console.log('Estadísticas actualizadas:', data);
  // Actualizar contadores de mensajes
});

// Mantener conexión viva
socket.on('pong', () => {
  console.log('Conexión viva');
});

// Errores
socket.on('error', (error) => {
  console.error('Error de WebSocket:', error);
  // Manejar errores de conexión
});
```

---

## 🎯 **Ejemplo Completo en React**

```javascript
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const BotMonitor = ({ botId, jwtToken }) => {
  const [botStatus, setBotStatus] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conectar al WebSocket
    const newSocket = io('http://localhost:3000', {
      auth: { token: jwtToken }
    });

    setSocket(newSocket);

    // Unirse a la room del bot
    newSocket.emit('join-bot-room', botId);

    // Solicitar estado inicial
    newSocket.emit('request-bot-status', botId);

    // Escuchar actualizaciones
    newSocket.on('bot-status-update', (data) => {
      if (data.botId === botId) {
        setBotStatus(data);
      }
    });

    newSocket.on('bot-connected', (data) => {
      if (data.botId === botId) {
        console.log('¡Bot conectado!');
        // Actualizar estado
      }
    });

    newSocket.on('bot-qr-generated', (data) => {
      if (data.botId === botId) {
        console.log('QR generado:', data.qrCode);
        // Mostrar QR
      }
    });

    // Ping para mantener conexión
    const pingInterval = setInterval(() => {
      newSocket.emit('ping');
    }, 30000); // Cada 30 segundos

    return () => {
      clearInterval(pingInterval);
      newSocket.emit('leave-bot-room', botId);
      newSocket.disconnect();
    };
  }, [botId, jwtToken]);

  return (
    <div className="bot-monitor">
      <h3>Estado del Bot: {botId}</h3>
      {botStatus ? (
        <div className="status-info">
          <p>Estado DB: {botStatus.database.status}</p>
          <p>Estado Real: {botStatus.realTime.isReady ? 'Listo' : 'No listo'}</p>
          <p>Teléfono: {botStatus.database.phoneNumber || 'N/A'}</p>
          <p>Listo para enviar: {botStatus.isReady ? '✅' : '❌'}</p>
        </div>
      ) : (
        <p>Cargando estado...</p>
      )}
    </div>
  );
};

export default BotMonitor;
```

---

## 📊 **Endpoint de Estadísticas**

**GET** `/api/websocket-stats` (Solo administradores)

Obtén estadísticas de conexiones WebSocket activas:

```json
{
  "success": true,
  "data": {
    "websocket": {
      "connectedUsers": 2,
      "totalSockets": 3,
      "activeBotRooms": 1,
      "rooms": [
        {
          "botId": "69050008605fde1e00be6704",
          "connectedSockets": 2
        }
      ]
    },
    "timestamp": "2025-10-31T18:31:34.000Z"
  }
}
```

---

## 🔐 **Autenticación**

- **JWT Token**: Requerido en `socket.handshake.auth.token`
- **Verificación automática**: El servidor valida el token al conectar
- **Acceso por bot**: Solo puedes unirte a rooms de bots que te pertenecen (o todos si eres admin)

---

## 🎉 **Beneficios**

✅ **Actualizaciones en tiempo real** - No más polling
✅ **Mejor UX** - Interfaz responde inmediatamente
✅ **Notificaciones push** - Alertas automáticas
✅ **Menos carga en servidor** - Una conexión WebSocket vs múltiples HTTP
✅ **Estado consistente** - UI siempre sincronizada con backend

---

## 🔄 **Integración con Listado de Bots**

Los WebSockets **NO solo se usan para el listado de bots**, sino que **complementan** el sistema completo:

### 🔄 **Flujo de Trabajo:**

1. **Carga Inicial**: Usas `GET /api/bots` (HTTP) para obtener la lista inicial
2. **Sincronización Automática**: Al cargar la lista, el backend emite `bot-status-update` para cada bot
3. **Actualizaciones en Tiempo Real**: Cualquier cambio (conexión, desconexión, envío de mensajes) se refleja automáticamente
4. **Estado Consistente**: Tu frontend siempre tiene el estado más actualizado

### 🎯 **Ejemplo Práctico:**

```javascript
// 1. Cargar lista inicial (HTTP)
const bots = await fetch('/api/bots').then(r => r.json());

// 2. WebSocket mantiene sincronizado
socket.on('bot-status-update', (update) => {
  // Actualizar automáticamente el estado del bot en la lista
  setBots(prev => prev.map(bot => 
    bot._id === update.botId ? {...bot, ...update} : bot
  ));
});
```

### 📊 **Eventos Disponibles:**

- **`bot-status-update`**: Estado actualizado (se emite en listados + cambios en tiempo real)
- **`bot-connected`**: Bot se conectó exitosamente
- **`bot-disconnected`**: Bot se desconectó
- **`bot-qr-generated`**: QR code generado para conexión
- **`bot-error`**: Error en el bot
- **`message-sent`**: Mensaje enviado exitosamente
- **`bot-log`**: Logs de actividad del bot

---

## 🚀 **Próximos Pasos**

1. **Implementa en tu React app** usando el ejemplo arriba
2. **Agrega indicadores visuales** para estados de conexión
3. **Implementa reconexión automática** si se pierde la conexión WebSocket
4. **Agrega notificaciones toast** para eventos importantes

¿Necesitas ayuda implementando algún componente específico en React?