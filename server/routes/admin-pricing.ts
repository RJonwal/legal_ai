import { Router } from "express";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = Router();

// Mock pricing plans data
const mockPricingPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for solo practitioners and small firms getting started with AI",
    price: 29.99,
    billingPeriod: "monthly",
    tokenAllowance: 50000,
    overageRate: 0.002,
    features: [
      "50K tokens per month",
      "AI-powered legal analysis",
      "Document generation",
      "Basic case management",
      "Email support"
    ],
    isPopular: false,
    isActive: true,
    stripePriceId: "price_starter_monthly"
  },
  {
    id: "professional",
    name: "Professional",
    description: "Ideal for growing practices that need advanced AI capabilities",
    price: 99.99,
    billingPeriod: "monthly",
    tokenAllowance: 200000,
    overageRate: 0.0015,
    features: [
      "200K tokens per month",
      "Advanced AI legal analysis",
      "Contract review & analysis",
      "Document automation",
      "Priority support",
      "Integration capabilities"
    ],
    isPopular: true,
    isActive: true,
    stripePriceId: "price_professional_monthly"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Complete solution for large firms with unlimited usage",
    price: 299.99,
    billingPeriod: "monthly",
    tokenAllowance: 1000000,
    overageRate: 0.001,
    features: [
      "1M tokens per month",
      "Custom AI model training",
      "Advanced analytics",
      "White-label options",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee"
    ],
    isPopular: false,
    isActive: true,
    stripePriceId: "price_enterprise_monthly"
  }
];

const mockTokenBillingConfig = {
  enabled: true,
  baseRatePerToken: 0.0001,
  bulkDiscounts: [
    { threshold: 100000, discountPercent: 5 },
    { threshold: 500000, discountPercent: 10 },
    { threshold: 1000000, discountPercent: 15 }
  ],
  freeTrialTokens: 10000
};

// Get all pricing plans
router.get("/pricing-plans", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    res.json(mockPricingPlans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
});

// Update pricing plan
router.put("/pricing-plans/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const updates = req.body;

    // Find and update the plan
    const planIndex = mockPricingPlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) {
      return res.status(404).json({ error: "Pricing plan not found" });
    }

    mockPricingPlans[planIndex] = { ...mockPricingPlans[planIndex], ...updates };

    console.log(`Updated pricing plan ${id}:`, updates);

    res.json(mockPricingPlans[planIndex]);
  } catch (error) {
    console.error("Error updating pricing plan:", error);
    res.status(500).json({ error: "Failed to update pricing plan" });
  }
});

// Get token billing configuration
router.get("/token-billing", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    res.json(mockTokenBillingConfig);
  } catch (error) {
    console.error("Error fetching token billing config:", error);
    res.status(500).json({ error: "Failed to fetch token billing configuration" });
  }
});

// Update token billing configuration
router.put("/token-billing", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const updates = req.body;
    
    // Update the configuration
    Object.assign(mockTokenBillingConfig, updates);

    console.log("Updated token billing configuration:", updates);

    res.json(mockTokenBillingConfig);
  } catch (error) {
    console.error("Error updating token billing config:", error);
    res.status(500).json({ error: "Failed to update token billing configuration" });
  }
});

// Get billing analytics
router.get("/billing-analytics", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Mock analytics data
    const analytics = {
      totalRevenue: 24583,
      tokenUsage: 2300000,
      overageRevenue: 3421,
      planDistribution: {
        starter: 45,
        professional: 35,
        enterprise: 20
      },
      monthlyGrowth: {
        revenue: 12,
        users: 8,
        tokenUsage: 18
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching billing analytics:", error);
    res.status(500).json({ error: "Failed to fetch billing analytics" });
  }
});

export default router;