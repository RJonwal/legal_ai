import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { sql, eq } from "drizzle-orm";

const router = Router();

// Demo request schema
const DemoRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  practiceArea: z.string().optional(),
  firmSize: z.string().optional(),
  currentSoftware: z.string().optional(),
  specificNeeds: z.string().optional(),
  preferredTime: z.string().optional(),
  source: z.string().default("landing-page")
});

// Submit demo request
router.post("/", async (req, res) => {
  try {
    const validatedData = DemoRequestSchema.parse(req.body);
    
    // Create temporary demo requests table structure for now
    const tempRequest = {
      id: Math.floor(Math.random() * 10000),
      ...validatedData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // TODO: Replace with actual database insert once schema is migrated
    console.log('Demo request received:', tempRequest);

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      success: true,
      message: "Demo request submitted successfully",
      requestId: tempRequest.id
    });
  } catch (error) {
    console.error("Error submitting demo request:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors
      });
    }

    res.status(500).json({
      error: "Failed to submit demo request"
    });
  }
});

// Get all demo requests (admin only)
router.get("/", async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    // TODO: Replace with actual database query once schema is migrated
    
    const mockRequests = [
      {
        id: 1,
        name: "John Doe",
        email: "john@lawfirm.com",
        company: "Doe & Associates",
        phone: "+1-555-0123",
        practiceArea: "Corporate Law",
        firmSize: "10-50",
        currentSoftware: "Clio",
        specificNeeds: "Document automation",
        preferredTime: "Morning",
        source: "landing-page",
        status: "pending",
        createdAt: new Date()
      }
    ];

    res.json(mockRequests);
  } catch (error) {
    console.error("Error fetching demo requests:", error);
    res.status(500).json({ error: "Failed to fetch demo requests" });
  }
});

// Update demo request status (admin only)
router.patch("/:id", async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    // TODO: Replace with actual database update once schema is migrated
    
    const { id } = req.params;
    const { status, notes } = req.body;

    const updatedRequest = {
      id: parseInt(id),
      status,
      adminNotes: notes,
      updatedAt: new Date()
    };

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating demo request:", error);
    res.status(500).json({ error: "Failed to update demo request" });
  }
});

export default router;