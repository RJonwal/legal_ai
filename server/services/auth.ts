import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { User } from "@shared/schema";
import { Request, Response, NextFunction } from "express";

import { getJWTSecret } from "../utils/jwt";

const JWT_SECRET = getJWTSecret();
const JWT_EXPIRES_IN = "7d";

export interface AuthRequest extends Request {
  user?: User;
}

export class AuthService {
  static async login(username: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      // Try to find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return { user, token };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  static async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    userType: "attorney" | "pro_se";
  }): Promise<{ user: User; token: string } | null> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error("Username already exists");
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        throw new Error("Email already registered");
      }

      const user = await storage.createUser(userData);

      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return { user, token };
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  }

  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      console.log('vkiegvuevber', decoded);
      const user = await storage.getUser(decoded.userId);

      
      return user || null;
    } catch (error) {
      return null;
    }
  }

  static async generateResetToken(email: string): Promise<string | null> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return null;
      }

      const resetToken = jwt.sign(
        { userId: user.id, type: "reset" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await storage.setResetToken(email, resetToken, expiry);
      return resetToken;
    } catch (error) {
      console.error("Reset token generation error:", error);
      return null;
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; type: string };
      
      if (decoded.type !== "reset") {
        return false;
      }

      const user = await storage.getUser(decoded.userId);
      if (!user || user.resetToken !== token) {
        return false;
      }

      if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
        return false;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updatePassword(user.id, hashedPassword);
      
      // Clear reset token
      await storage.updateUser(user.id, { resetToken: null, resetTokenExpiry: null });
      
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      return false;
    }
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  try {
    const user = await AuthService.verifyToken(token);
    if (!user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ message: "Invalid token" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};