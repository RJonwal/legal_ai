import { Router } from "express";
import { AuthService, authenticateToken, type AuthRequest } from "../services/auth";
import { EmailService } from "../services/email";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const result = await AuthService.login(username, password);
    
    if (!result) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        userType: result.user.userType,
        isVerified: result.user.isVerified,
        subscriptionStatus: result.user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register route
router.post("/register", async (req, res) => {
  try {
    const registerSchema = insertUserSchema.extend({
      confirmPassword: z.string().min(1, "Password confirmation is required")
    }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });

    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    const { confirmPassword, ...userData } = validation.data;

    const result = await AuthService.register(userData);
    
    if (!result) {
      return res.status(400).json({ message: "Registration failed" });
    }

    // Send welcome email
    await EmailService.sendWelcomeEmail(result.user.email, result.user.fullName);

    res.status(201).json({
      message: "Registration successful",
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        userType: result.user.userType,
        isVerified: result.user.isVerified,
        subscriptionStatus: result.user.subscriptionStatus
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.message === "Username already exists" || error.message === "Email already registered") {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user route
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      userType: user.userType,
      isVerified: user.isVerified,
      subscriptionStatus: user.subscriptionStatus,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const resetToken = await AuthService.generateResetToken(email);
    
    if (!resetToken) {
      // Don't reveal whether the email exists for security
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // Get user to send personalized email
    const user = await AuthService.verifyToken(resetToken);
    if (user) {
      await EmailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);
    }

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const success = await AuthService.resetPassword(token, newPassword);
    
    if (!success) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify token route
router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await AuthService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    res.json({ 
      valid: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        userType: user.userType,
        isVerified: user.isVerified,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;