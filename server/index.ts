import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin } from "./routes/auth";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "./routes/users";
import { getBots, getBotById, createBot, getBotQR, connectBot, restartBot, updateBot, deleteBot, sendMessage, getBotMessages } from "./routes/bots";
import { authenticateToken, requireAdmin } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/login", handleLogin);

  // Users CRUD routes (protected)
  app.get("/api/users", authenticateToken, requireAdmin, getUsers);
  app.get("/api/users/:id", authenticateToken, requireAdmin, getUserById);
  app.post("/api/users", authenticateToken, requireAdmin, createUser);
  app.put("/api/users/:id", authenticateToken, requireAdmin, updateUser);
  app.delete("/api/users/:id", authenticateToken, requireAdmin, deleteUser);

  // Bots CRUD routes (protected)
  app.get("/api/bots", authenticateToken, getBots);
  app.get("/api/bots/:id", authenticateToken, getBotById);
  app.post("/api/bots", authenticateToken, createBot);
  app.put("/api/bots/:id", authenticateToken, updateBot);
  app.delete("/api/bots/:id", authenticateToken, deleteBot);
  
  // Bot specific operations
  app.get("/api/bots/:id/qr-public", authenticateToken, getBotQR);
  app.post("/api/bots/:id/connect", authenticateToken, connectBot);
  app.post("/api/bots/:id/restart", authenticateToken, restartBot);
  app.get("/api/bots/:id/messages", authenticateToken, getBotMessages);
  app.post("/api/bots/:apiKey/send", authenticateToken, sendMessage);
  
  console.log("Express server configured with auth, users, and bots routes");

  return app;
}
