import { Router } from "express";
import { upload, FileUploadService, handleMulterError } from "../services/file-upload";
import { authenticateToken, type AuthRequest } from "../services/auth";
import { storage } from "../storage";
import path from "path";
import fs from "fs";

const router = Router();

// Upload multiple files
router.post("/upload", authenticateToken, upload.array("files", 5), handleMulterError, async (req: AuthRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { caseId } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (caseId) {
      const caseExists = await storage.getCase(parseInt(caseId));
      if (!caseExists) {
        // Clean up uploaded files if case doesn't exist
        for (const file of files) {
          FileUploadService.deleteFile(file.filename);
        }
        return res.status(400).json({ message: "Case not found" });
      }
    }

    const uploadedFiles = [];
    
    for (const file of files) {
      const validation = FileUploadService.validateFile(file);
      
      if (!validation.isValid) {
        // Clean up invalid file
        FileUploadService.deleteFile(file.filename);
        return res.status(400).json({ message: validation.error });
      }

      const fileInfo = FileUploadService.getFileInfo(file.filename);
      
      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: fileInfo.url,
        path: fileInfo.path
      });

      // If caseId provided, create document record
      if (caseId) {
        await storage.createDocument({
          caseId: parseInt(caseId),
          title: file.originalname,
          content: `Uploaded file: ${file.originalname}`,
          documentType: "uploaded",
          status: "active"
        });
      }
    }

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get uploaded file
router.get("/file/:filename", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const fileInfo = FileUploadService.getFileInfo(filename);
    
    if (!fs.existsSync(fileInfo.path)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set appropriate headers
    const fileExtension = path.extname(filename).toLowerCase();
    const contentType = getContentType(fileExtension);
    
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fileInfo.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Download file
router.get("/download/:filename", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const fileInfo = FileUploadService.getFileInfo(filename);
    
    if (!fs.existsSync(fileInfo.path)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set download headers
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    
    // Stream the file
    const fileStream = fs.createReadStream(fileInfo.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete file
router.delete("/file/:filename", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const success = await FileUploadService.deleteFile(filename);
    
    if (!success) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get file info
router.get("/info/:filename", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const fileInfo = FileUploadService.getFileInfo(filename);
    
    if (!fs.existsSync(fileInfo.path)) {
      return res.status(404).json({ message: "File not found" });
    }

    const stats = fs.statSync(fileInfo.path);
    const fileExtension = path.extname(filename).toLowerCase();
    
    res.json({
      filename: filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: fileExtension,
      contentType: getContentType(fileExtension),
      url: fileInfo.url
    });
  } catch (error) {
    console.error("Get file info error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Helper function to get content type based on file extension
function getContentType(extension: string): string {
  const contentTypes: { [key: string]: string } = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  };
  
  return contentTypes[extension] || "application/octet-stream";
}

export default router;