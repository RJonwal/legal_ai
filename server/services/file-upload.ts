import multer from "multer";
import path from "path";
import { Request } from "express";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + sanitizedOriginalName);
  }
});

// File filter for security
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, Word documents, text files, and images are allowed."));
  }
};

// Create multer instance with configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// File upload service
export class FileUploadService {
  static getFileInfo(filename: string): { path: string; url: string } {
    const filePath = path.join(uploadsDir, filename);
    const fileUrl = `/uploads/${filename}`;
    
    return { path: filePath, url: fileUrl };
  }

  static async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  static validateFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: "No file provided" };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: "File size too large (max 10MB)" };
    }

    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".gif", ".xls", ".xlsx"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { isValid: false, error: "Invalid file extension" };
    }

    return { isValid: true };
  }

  static getFileSize(filename: string): number {
    try {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  static async cleanupOldFiles(maxAgeInDays: number = 30): Promise<void> {
    try {
      const files = fs.readdirSync(uploadsDir);
      const now = Date.now();
      const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert to milliseconds

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error("Error cleaning up old files:", error);
    }
  }
}

// Error handling middleware for multer
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Maximum is 5 files per upload." });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Unexpected file field." });
    }
  }
  
  if (error.message === "Invalid file type. Only PDF, Word documents, text files, and images are allowed.") {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
};