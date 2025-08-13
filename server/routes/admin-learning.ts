import { Router } from "express";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = Router();

// Mock learning resources data
const mockLearningResources = [
  {
    id: "1",
    title: "Getting Started with AI Legal Assistant",
    description: "Learn the basics of using our AI-powered legal assistant for case analysis and document generation.",
    content: "# Getting Started with AI Legal Assistant\n\nWelcome to our comprehensive guide...",
    type: "guide",
    category: "getting-started",
    tags: ["ai", "basics", "tutorial"],
    isPublished: true,
    isFeatured: true,
    difficulty: "beginner",
    estimatedReadTime: 10,
    author: "Legal AI Team",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
    viewCount: 1245,
    order: 1
  },
  {
    id: "2",
    title: "Advanced Document Analysis Techniques",
    description: "Deep dive into advanced features for contract analysis and document review.",
    content: "# Advanced Document Analysis\n\nThis guide covers...",
    type: "tutorial",
    category: "document-analysis",
    tags: ["contracts", "analysis", "advanced"],
    isPublished: true,
    isFeatured: false,
    difficulty: "advanced",
    estimatedReadTime: 25,
    author: "Legal AI Team",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
    viewCount: 892,
    order: 2
  },
  {
    id: "3",
    title: "Case Management Best Practices",
    description: "Organize your cases effectively with our proven workflows and templates.",
    content: "# Case Management Best Practices\n\nEffective case management...",
    type: "article",
    category: "case-management",
    tags: ["workflow", "organization", "best-practices"],
    isPublished: true,
    isFeatured: false,
    difficulty: "intermediate",
    estimatedReadTime: 15,
    author: "Legal Practice Expert",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-25T00:00:00Z",
    viewCount: 567,
    order: 3
  }
];

const mockLearningCategories = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Essential guides for new users",
    icon: "🚀",
    color: "#3b82f6",
    isActive: true,
    order: 1
  },
  {
    id: "document-analysis",
    name: "Document Analysis",
    description: "Advanced contract and document review techniques",
    icon: "📄",
    color: "#10b981",
    isActive: true,
    order: 2
  },
  {
    id: "case-management",
    name: "Case Management",
    description: "Best practices for organizing and managing cases",
    icon: "⚖️",
    color: "#f59e0b",
    isActive: true,
    order: 3
  },
  {
    id: "ai-features",
    name: "AI Features",
    description: "Deep dives into AI-powered capabilities",
    icon: "🤖",
    color: "#8b5cf6",
    isActive: true,
    order: 4
  }
];

// Get all learning resources
router.get("/learning-resources", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    res.json(mockLearningResources);
  } catch (error) {
    console.error("Error fetching learning resources:", error);
    res.status(500).json({ error: "Failed to fetch learning resources" });
  }
});

// Create learning resource
router.post("/learning-resources", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const resourceData = req.body;
    const newResource = {
      id: String(Date.now()),
      ...resourceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0
    };

    mockLearningResources.push(newResource);

    console.log("Created new learning resource:", newResource.title);

    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error creating learning resource:", error);
    res.status(500).json({ error: "Failed to create learning resource" });
  }
});

// Update learning resource
router.put("/learning-resources/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const updates = req.body;

    const resourceIndex = mockLearningResources.findIndex(resource => resource.id === id);
    if (resourceIndex === -1) {
      return res.status(404).json({ error: "Learning resource not found" });
    }

    mockLearningResources[resourceIndex] = {
      ...mockLearningResources[resourceIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    console.log(`Updated learning resource ${id}:`, updates.title);

    res.json(mockLearningResources[resourceIndex]);
  } catch (error) {
    console.error("Error updating learning resource:", error);
    res.status(500).json({ error: "Failed to update learning resource" });
  }
});

// Delete learning resource
router.delete("/learning-resources/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const resourceIndex = mockLearningResources.findIndex(resource => resource.id === id);
    
    if (resourceIndex === -1) {
      return res.status(404).json({ error: "Learning resource not found" });
    }

    const deletedResource = mockLearningResources.splice(resourceIndex, 1)[0];

    console.log("Deleted learning resource:", deletedResource.title);

    res.json({ message: "Learning resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting learning resource:", error);
    res.status(500).json({ error: "Failed to delete learning resource" });
  }
});

// Get learning categories
router.get("/learning-categories", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    res.json(mockLearningCategories);
  } catch (error) {
    console.error("Error fetching learning categories:", error);
    res.status(500).json({ error: "Failed to fetch learning categories" });
  }
});

// Update learning category
router.put("/learning-categories/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const updates = req.body;

    const categoryIndex = mockLearningCategories.findIndex(category => category.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Learning category not found" });
    }

    mockLearningCategories[categoryIndex] = {
      ...mockLearningCategories[categoryIndex],
      ...updates
    };

    console.log(`Updated learning category ${id}:`, updates.name);

    res.json(mockLearningCategories[categoryIndex]);
  } catch (error) {
    console.error("Error updating learning category:", error);
    res.status(500).json({ error: "Failed to update learning category" });
  }
});

export default router;