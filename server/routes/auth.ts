import { RequestHandler } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { LoginRequest, LoginResponse, User } from "@shared/api";

/**
 * Mock user data - En producción esto vendría de una base de datos
 */
const mockUsers = [
  {
    id: "6903ce20bbbe9f91420dd6f4",
    name: process.env.ADMIN_NAME || "Administrador",
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123", // En producción debería estar hasheada
    role: "admin",
    isActive: true
  }
];

/**
 * Endpoint para autenticación de usuarios
 * POST /api/auth/login
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    console.log("Login endpoint called with body:", req.body);
    
    const { username, password }: LoginRequest = req.body;

    // Validar que se proporcionen username y password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
        token: "",
        user: {} as User
      });
    }

    // Buscar usuario en los datos mock
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        token: "",
        user: {} as User
      });
    }

    // Verificar contraseña (en este caso comparación directa, en producción usar bcrypt)
    const isValidPassword = password === user.password;
    // Para producción usar: const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        token: "",
        user: {} as User
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is disabled",
        token: "",
        user: {} as User
      });
    }

    // Generar JWT token
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret";
    
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as any }
    );

    // Preparar respuesta del usuario (sin contraseña)
    const userResponse: User = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    };

    // Respuesta exitosa
    const response: LoginResponse = {
      success: true,
      token,
      user: userResponse
    };

    res.json(response);

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      token: "",
      user: {} as User
    });
  }
};