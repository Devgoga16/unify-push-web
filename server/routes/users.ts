import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { UsersListResponse, UserResponse, UserRequest, UserWithTimestamps } from "@shared/api";

/**
 * Mock data para usuarios - En producción esto vendría de una base de datos
 */
let mockUsersData: UserWithTimestamps[] = [
  {
    _id: "6903ce20bbbe9f91420dd6f4",
    name: process.env.ADMIN_NAME || "Administrador",
    username: process.env.ADMIN_USERNAME || "admin",
    role: "admin",
    isActive: true,
    createdAt: "2025-10-30T20:44:16.823Z",
    updatedAt: "2025-10-30T20:44:16.823Z"
  },
  // Usuario de ejemplo adicional
  {
    _id: "6903ce20bbbe9f91420dd6f5",
    name: "Usuario Demo",
    username: "demo",
    role: "user",
    isActive: true,
    createdAt: "2025-10-30T20:45:16.823Z",
    updatedAt: "2025-10-30T20:45:16.823Z"
  }
];

/**
 * GET /api/users - Obtener lista de usuarios
 */
export const getUsers: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    console.log("Getting users list for user:", req.user?.username);

    const response: UsersListResponse = {
      success: true,
      count: mockUsersData.length,
      data: mockUsersData
    };

    res.json(response);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      count: 0,
      data: [],
      message: "Internal server error"
    });
  }
};

/**
 * GET /api/users/:id - Obtener usuario por ID
 */
export const getUserById: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = mockUsersData.find(u => u._id === id);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: {} as UserWithTimestamps,
        message: "User not found"
      });
    }

    const response: UserResponse = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      data: {} as UserWithTimestamps,
      message: "Internal server error"
    });
  }
};

/**
 * POST /api/users - Crear nuevo usuario
 */
export const createUser: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    const { name, username, password, role, isActive }: UserRequest = req.body;

    // Validaciones básicas
    if (!name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        data: {} as UserWithTimestamps,
        message: "Name, username, password, and role are required"
      });
    }

    // Verificar si el username ya existe
    const existingUser = mockUsersData.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        data: {} as UserWithTimestamps,
        message: "Username already exists"
      });
    }

    // Crear nuevo usuario
    const newUser: UserWithTimestamps = {
      _id: generateId(),
      name,
      username,
      role,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockUsersData.push(newUser);

    const response: UserResponse = {
      success: true,
      data: newUser
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      data: {} as UserWithTimestamps,
      message: "Internal server error"
    });
  }
};

/**
 * PUT /api/users/:id - Actualizar usuario
 */
export const updateUser: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, username, role, isActive }: UserRequest = req.body;

    const userIndex = mockUsersData.findIndex(u => u._id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        data: {} as UserWithTimestamps,
        message: "User not found"
      });
    }

    // Verificar si el nuevo username ya existe (solo si se está cambiando)
    if (username && username !== mockUsersData[userIndex].username) {
      const existingUser = mockUsersData.find(u => u.username === username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          data: {} as UserWithTimestamps,
          message: "Username already exists"
        });
      }
    }

    // Actualizar usuario
    if (name) mockUsersData[userIndex].name = name;
    if (username) mockUsersData[userIndex].username = username;
    if (role) mockUsersData[userIndex].role = role;
    if (isActive !== undefined) mockUsersData[userIndex].isActive = isActive;
    mockUsersData[userIndex].updatedAt = new Date().toISOString();

    const response: UserResponse = {
      success: true,
      data: mockUsersData[userIndex]
    };

    res.json(response);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      data: {} as UserWithTimestamps,
      message: "Internal server error"
    });
  }
};

/**
 * DELETE /api/users/:id - Eliminar usuario
 */
export const deleteUser: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const userIndex = mockUsersData.findIndex(u => u._id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        data: {} as UserWithTimestamps,
        message: "User not found"
      });
    }

    // No permitir eliminar el último admin
    const user = mockUsersData[userIndex];
    if (user.role === 'admin') {
      const adminCount = mockUsersData.filter(u => u.role === 'admin' && u.isActive).length;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          data: {} as UserWithTimestamps,
          message: "Cannot delete the last active admin user"
        });
      }
    }

    const deletedUser = mockUsersData.splice(userIndex, 1)[0];

    const response: UserResponse = {
      success: true,
      data: deletedUser
    };

    res.json(response);
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      data: {} as UserWithTimestamps,
      message: "Internal server error"
    });
  }
};

/**
 * Función auxiliar para generar IDs únicos
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}