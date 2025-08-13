import { Router } from "express";
import { db } from "../db";
import { analytics, systemMetrics, users, cases, documents } from "../../shared/schema";
import { sql, eq, gte, lte, count, desc } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = Router();

// Get dashboard analytics
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user statistics
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeUsers] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.updatedAt, sevenDaysAgo));
    const [newUsers] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

    // Get case statistics
    const [totalCases] = await db.select({ count: count() }).from(cases);
    const [activeCases] = await db.select({ count: count() })
      .from(cases)
      .where(eq(cases.status, 'active'));
    const [newCases] = await db.select({ count: count() })
      .from(cases)
      .where(gte(cases.createdAt, thirtyDaysAgo));

    // Get document statistics
    const [totalDocuments] = await db.select({ count: count() }).from(documents);
    const [newDocuments] = await db.select({ count: count() })
      .from(documents)
      .where(gte(documents.createdAt, thirtyDaysAgo));

    // Get analytics events for charts
    const analyticsData = await db.select({
      eventType: analytics.eventType,
      count: count(),
      date: sql<string>`DATE(${analytics.timestamp})`
    })
    .from(analytics)
    .where(gte(analytics.timestamp, thirtyDaysAgo))
    .groupBy(analytics.eventType, sql`DATE(${analytics.timestamp})`)
    .orderBy(sql`DATE(${analytics.timestamp})`);

    // Calculate growth rates
    const prevThirtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const [prevNewUsers] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, prevThirtyDaysAgo))
      .where(lte(users.createdAt, thirtyDaysAgo));

    const userGrowthRate = prevNewUsers.count > 0 
      ? ((newUsers.count - prevNewUsers.count) / prevNewUsers.count) * 100 
      : 0;

    res.json({
      overview: {
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        totalCases: totalCases.count,
        activeCases: activeCases.count,
        totalDocuments: totalDocuments.count,
        newUsers: newUsers.count,
        newCases: newCases.count,
        newDocuments: newDocuments.count,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100
      },
      chartData: {
        userActivity: analyticsData.filter(d => d.eventType === 'page_view'),
        documentGeneration: analyticsData.filter(d => d.eventType === 'document_generated'),
        aiUsage: analyticsData.filter(d => d.eventType === 'ai_request'),
        caseActivity: analyticsData.filter(d => d.eventType === 'case_activity')
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get user analytics
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User registration trends
    const userTrends = await db.select({
      date: sql<string>`DATE(${users.createdAt})`,
      count: count()
    })
    .from(users)
    .where(gte(users.createdAt, startDate))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);

    // User type distribution
    const userTypes = await db.select({
      userType: users.userType,
      count: count()
    })
    .from(users)
    .groupBy(users.userType);

    // Top active users
    const topUsers = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      caseCount: count(cases.id)
    })
    .from(users)
    .leftJoin(cases, eq(users.id, cases.assignedAttorney))
    .groupBy(users.id, users.fullName, users.email)
    .orderBy(desc(count(cases.id)))
    .limit(10);

    res.json({
      trends: userTrends,
      distribution: userTypes,
      topUsers
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

// Track analytics event
router.post("/track", async (req, res) => {
  try {
    const { eventType, eventData, userId, sessionId } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: "Event type is required" });
    }

    await db.insert(analytics).values({
      eventType,
      eventData: eventData || {},
      userId: userId || null,
      sessionId: sessionId || null,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    res.status(500).json({ error: "Failed to track event" });
  }
});

// Get system metrics
router.get("/metrics", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const metrics = await db.select()
      .from(systemMetrics)
      .where(gte(systemMetrics.timestamp, oneDayAgo))
      .orderBy(desc(systemMetrics.timestamp));

    // Group metrics by type
    const groupedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = [];
      }
      acc[metric.metricType].push(metric);
      return acc;
    }, {} as Record<string, typeof metrics>);

    res.json(groupedMetrics);
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;