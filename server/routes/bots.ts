import { RequestHandler } from "express";
import { Bot, BotsListResponse, BotResponse, BotRequest, SendMessageRequest, SendMessageResponse, MessagesResponse, Message } from "@shared/api";

// Mock data - Replace with actual database operations
let mockBots: Bot[] = [
  // Estado: Conectado
  {
    _id: "6903dc89abc2d0b71500c92d",
    name: "Mi Bot de WhatsApp",
    description: "Bot para atención al cliente",
    apiKey: "wba-abcd1234efgh5678ijkl9012",
    status: "connected",
    qrCode: null,
    phoneNumber: "+1234567890",
    owner: "admin",
    isActive: true,
    lastActivity: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    endpointUrl: "https://api.whatsapp.com/bot/wba-abcd1234efgh5678ijkl9012",
    settings: {
      welcomeMessage: "¡Hola! Bienvenido a nuestro servicio.",
      autoReply: true,
      maxMessagesPerMinute: 60
    }
  },
  // Estado: Configurado (pending con QR)
  {
    _id: "6903dc89abc2d0b71500c92e",
    name: "Bot de Ventas",
    description: "Bot especializado en ventas",
    apiKey: "wba-zyxw9876vuts5432ponm1098",
    status: "pending",
    qrCode: "data:image/png;base64,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",
    phoneNumber: null,
    owner: "admin",
    isActive: true,
    lastActivity: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    endpointUrl: "https://api.whatsapp.com/bot/wba-zyxw9876vuts5432ponm1098",
    settings: {
      welcomeMessage: "¡Hola! ¿En qué puedo ayudarte con tu compra?",
      autoReply: true,
      maxMessagesPerMinute: 30
    }
  },
  // Estado: Creado (pending sin QR)
  {
    _id: "6903dc89abc2d0b71500c92f",
    name: "Bot de Soporte",
    description: "Bot para soporte técnico",
    apiKey: "wba-mnop3456qrst7890uvwx1234",
    status: "pending",
    qrCode: null,
    phoneNumber: null,
    owner: "admin",
    isActive: true,
    lastActivity: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    endpointUrl: "https://api.whatsapp.com/bot/wba-mnop3456qrst7890uvwx1234",
    settings: {
      welcomeMessage: "¡Hola! Estoy aquí para ayudarte con soporte técnico.",
      autoReply: true,
      maxMessagesPerMinute: 45
    }
  }
];

// Mock messages data - Replace with actual database operations
let mockMessages: Message[] = [
  {
    _id: "6903fee9eeb70bc7e06eb0c7",
    bot: "6903dc89abc2d0b71500c92d",
    to: "51933180959",
    message: "Ya quiero probar esa pizzitaaaaaaa, desde el botcito hablando",
    status: "sent",
    messageId: "true_51933180959@c.us_3EB01A1365EA2ACD257F48",
    error: null,
    sentAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: "6903fdeeeeb70bc7e06eb0c1",
    bot: "6903dc89abc2d0b71500c92d",
    to: "51942769412",
    message: "Probando desde la web bro",
    status: "sent",
    messageId: "true_51942769412@c.us_3EB04521884B31289E19D3",
    error: null,
    sentAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    _id: "6903fd94eeb70bc7e06eb0bb",
    bot: "6903dc89abc2d0b71500c92d",
    to: "933180959",
    message: "Probando sin el 51",
    status: "sent",
    messageId: "true_933180959@c.us_3EB0CA6E0D8431C7AB86A8",
    error: null,
    sentAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    _id: "6903fd69eeb70bc7e06eb0b5",
    bot: "6903dc89abc2d0b71500c92d",
    to: "51933180959",
    message: "Probando desde web",
    status: "sent",
    messageId: "true_51933180959@c.us_3EB0E4FA863A72FB4C8C08",
    error: null,
    sentAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    _id: "6903fb7aeeb70bc7e06eb088",
    bot: "6903dc89abc2d0b71500c92d",
    to: "51955768897",
    message: "Hola, este es un mensaje desde mi bot!",
    status: "sent",
    messageId: "true_51955768897@c.us_3EB08980CE221B966C9CCB_out",
    error: null,
    sentAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    updatedAt: new Date(Date.now() - 18000000).toISOString()
  }
];

// GET /api/bots - List all bots
export const getBots: RequestHandler = (req, res) => {
  try {
    const response: BotsListResponse = {
      success: true,
      count: mockBots.length,
      data: mockBots,
      message: "Bots retrieved successfully"
    };
    res.json(response);
  } catch (error) {
    const response: BotsListResponse = {
      success: false,
      count: 0,
      data: [],
      message: "Failed to retrieve bots"
    };
    res.status(500).json(response);
  }
};

// GET /api/bots/:id - Get specific bot
export const getBotById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const bot = mockBots.find(b => b._id === id);
    
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot not found"
      });
    }

    const response: BotResponse = {
      success: true,
      data: bot,
      message: "Bot retrieved successfully"
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bot"
    });
  }
};

// POST /api/bots - Create new bot
export const createBot: RequestHandler = (req, res) => {
  try {
    const botData: BotRequest = req.body;
    
    if (!botData.name || !botData.description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required"
      });
    }

    const now = new Date().toISOString();
    const newBot: Bot = {
      _id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: botData.name,
      description: botData.description,
      apiKey: `wba-${Math.random().toString(36).substr(2, 24)}`,
      status: "pending", // New bots start as pending
      qrCode: null,
      phoneNumber: null,
      owner: "admin", // TODO: Get from authenticated user
      isActive: botData.isActive ?? true,
      lastActivity: now,
      createdAt: now,
      updatedAt: now,
      endpointUrl: `https://api.whatsapp.com/bot/wba-${Math.random().toString(36).substr(2, 24)}`,
      settings: {
        welcomeMessage: botData.settings?.welcomeMessage || "¡Hola! Bienvenido a nuestro servicio.",
        autoReply: botData.settings?.autoReply ?? true,
        maxMessagesPerMinute: botData.settings?.maxMessagesPerMinute || 60
      }
    };

    mockBots.push(newBot);

    const response: BotResponse = {
      success: true,
      data: newBot,
      message: "Bot created successfully"
    };
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create bot"
    });
  }
};

// GET /api/bots/:id/qr-public - Get QR code for bot connection
export const getBotQR: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const bot = mockBots.find(b => b._id === id);
    
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot not found"
      });
    }

    // Check if bot has a QR code available
    if (!bot.qrCode) {
      return res.status(400).json({
        success: false,
        message: "QR code not available for this bot. Try connecting first."
      });
    }

    // Return the QR code stored in the bot
    res.json({
      success: true,
      qrCode: bot.qrCode,
      message: "QR code retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get QR code"
    });
  }
};

// POST /api/bots/:id/restart - Restart bot connection
export const restartBot: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const botIndex = mockBots.findIndex(b => b._id === id);
    
    if (botIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Bot not found"
      });
    }

    const bot = mockBots[botIndex];
    
    // Update bot status to pending (restarting)
    mockBots[botIndex] = {
      ...bot,
      status: "pending",
      phoneNumber: null,
      lastActivity: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockBots[botIndex],
      message: "Bot restart initiated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to restart bot"
    });
  }
};

// PUT /api/bots/:id - Update bot
export const updateBot: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const botIndex = mockBots.findIndex(b => b._id === id);
    
    if (botIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Bot not found"
      });
    }

    // Update bot data
    mockBots[botIndex] = {
      ...mockBots[botIndex],
      ...updateData,
      _id: id, // Preserve ID
      updatedAt: new Date().toISOString()
    };

    const response: BotResponse = {
      success: true,
      data: mockBots[botIndex],
      message: "Bot updated successfully"
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bot"
    });
  }
};

// DELETE /api/bots/:id - Delete bot
export const deleteBot: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const botIndex = mockBots.findIndex(b => b._id === id);
    
    if (botIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Bot not found"
      });
    }

    const bot = mockBots[botIndex];

    // Check if bot is connected - cannot delete connected bots
    if (bot.status === 'connected') {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar un bot conectado. Desconecta el bot primero."
      });
    }

    // Remove bot from array
    mockBots.splice(botIndex, 1);

    res.json({
      success: true,
      message: "Bot deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete bot"
    });
  }
};

// POST /api/bots/:id/connect - Connect bot to WhatsApp
export const connectBot: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const botIndex = mockBots.findIndex(b => b._id === id);
    
    if (botIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Bot not found"
      });
    }

    const bot = mockBots[botIndex];
    
    // Check if bot is in pending status and doesn't have QR code
    if (bot.status !== 'pending' || bot.qrCode !== null) {
      return res.status(400).json({
        success: false,
        message: "Bot must be in 'pending' status without QR code to connect"
      });
    }

    // Generate QR code for the bot (simulated)
    const qrCodeData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WnVBdXF1bfUEOqjO90mUSTByuHYzpQWS/d/z4tRZKl8aQAFbXpqNr39+qzO9dLzwIFOhxDOMsLEwXzH3Z2wcdWNJUzR6FdS5MFyzPbFP4rOzj9qAdjEzsWGTJPNRwLT0Rbu2f9HZNmODdjnA/Y1czGxtdHF2Yxh1YrJKJZbOVANO5qh5MKsfrjqnCNa3dQHMw5sKCGwV7jgTqwqPKEf4Z1dNKrJkw/6lhtRe7oHqsJIU6zCZ9vFNdC4wPNEJfxHqWMjvcdNzGwl9eV42P2w5jPCLYWcRhFyBDLtOI7lYAz1vuwttPxHxq3TA4u8nnPPmUTjZs5YVHOyTbckFxruwl2a6lCWr1SaHm6zOH6bVMUZrZCktTZKVuCE6eqJQJqCWEt9vk5ktJu3TLs/c+NLxSdHXcTbO8AkRfzYBP0NZtJtXdlrA==";

    // Update bot with QR code (simulating WhatsApp initialization)
    mockBots[botIndex] = {
      ...bot,
      qrCode: qrCodeData,
      status: 'pending', // Keep as pending while QR is being scanned
      lastActivity: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = {
      success: true,
      data: {
        success: true,
        message: "Bot inicializado correctamente"
      },
      message: "Bot conectándose a WhatsApp. El QR code estará disponible en unos segundos."
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to connect bot"
    });
  }
};

// POST /api/bots/:apiKey/send - Send test message
export const sendMessage: RequestHandler = (req, res) => {
  try {
    const { apiKey } = req.params;
    const { to, message }: SendMessageRequest = req.body;
    
    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: "Los campos 'to' y 'message' son requeridos"
      });
    }

    const bot = mockBots.find(b => b.apiKey === apiKey);
    
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot no encontrado"
      });
    }

    // Check if bot is connected
    if (bot.status !== 'connected') {
      return res.status(400).json({
        success: false,
        message: "El bot debe estar conectado para enviar mensajes"
      });
    }

    // Simulate message sending
    const messageId = `true_${to}@c.us_${Date.now()}_out`;
    
    const response: SendMessageResponse = {
      success: true,
      data: {
        messageId,
        message: "Mensaje enviado exitosamente",
        bot: {
          name: bot.name,
          phoneNumber: bot.phoneNumber || "N/A"
        }
      }
    };

    // Update bot's last activity
    const botIndex = mockBots.findIndex(b => b.apiKey === apiKey);
    if (botIndex !== -1) {
      mockBots[botIndex] = {
        ...bot,
        lastActivity: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje"
    });
  }
};

// GET /api/bots/:id/messages - Get bot message history
export const getBotMessages: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Find bot to verify it exists
    const bot = mockBots.find(b => b._id === id);
    
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot no encontrado"
      });
    }

    // Filter messages for this bot
    const botMessages = mockMessages.filter(m => m.bot === id);
    
    // Calculate pagination
    const total = botMessages.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Get paginated messages (sorted by creation date, newest first)
    const sortedMessages = botMessages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

    const response: MessagesResponse = {
      success: true,
      data: paginatedMessages,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      },
      message: "Error al obtener el historial de mensajes"
    });
  }
};