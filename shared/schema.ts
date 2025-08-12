import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for PostgreSQL session store
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("attorney"),
  userType: text("user_type").notNull().default("attorney"), // "attorney" or "pro_se"
  isVerified: boolean("is_verified").default(false),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  // Stripe fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  caseNumber: text("case_number").unique(),
  caseType: text("case_type").notNull(),
  status: text("status").notNull().default("active"),
  priority: text("priority").notNull().default("medium"),
  clientName: text("client_name").notNull(),
  opposingParty: text("opposing_party"),
  assignedAttorney: integer("assigned_attorney").references(() => users.id),
  lastAccessedAt: timestamp("last_accessed_at"),
  bookmarked: boolean("bookmarked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  documentType: text("document_type").notNull(),
  status: text("status").notNull().default("draft"),
  folderId: text("folder_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const caseTimeline = pgTable("case_timeline", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  isDeadline: boolean("is_deadline").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attorneyProfiles = pgTable("attorney_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  barNumber: text("bar_number"),
  firmName: text("firm_name"),
  practiceAreas: text("practice_areas").array(),
  yearsOfExperience: integer("years_of_experience"),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  website: text("website"),
  bio: text("bio"),
  hourlyRate: integer("hourly_rate"), // in cents
  availableForProSe: boolean("available_for_pro_se").default(true),
  maxProSeClients: integer("max_pro_se_clients").default(5),
  isVerified: boolean("is_verified").default(false),
  subscription: text("subscription").default("free"), // "free", "basic", "premium"
  subscriptionExpiry: timestamp("subscription_expiry"),
  rating: integer("rating").default(0), // 0-500 (5.00 stars)
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attorneyConnections = pgTable("attorney_connections", {
  id: serial("id").primaryKey(),
  attorneyId: integer("attorney_id").references(() => users.id),
  proSeUserId: integer("pro_se_user_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // "pending", "active", "completed", "cancelled"
  connectionType: text("connection_type").notNull().default("consultation"), // "consultation", "representation", "advice"
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  rating: integer("rating"), // 1-5 stars from pro se user
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attorneyReviews = pgTable("attorney_reviews", {
  id: serial("id").primaryKey(),
  attorneyId: integer("attorney_id").references(() => users.id),
  reviewerId: integer("reviewer_id").references(() => users.id),
  connectionId: integer("connection_id").references(() => attorneyConnections.id),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimelineSchema = createInsertSchema(caseTimeline).omit({
  id: true,
  createdAt: true,
});

export const insertAttorneyProfileSchema = createInsertSchema(attorneyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttorneyConnectionSchema = createInsertSchema(attorneyConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttorneyReviewSchema = createInsertSchema(attorneyReviews).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type TimelineEvent = typeof caseTimeline.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineSchema>;
export type AttorneyProfile = typeof attorneyProfiles.$inferSelect;
export type InsertAttorneyProfile = z.infer<typeof insertAttorneyProfileSchema>;
export type AttorneyConnection = typeof attorneyConnections.$inferSelect;
export type InsertAttorneyConnection = z.infer<typeof insertAttorneyConnectionSchema>;
export type AttorneyReview = typeof attorneyReviews.$inferSelect;
export type InsertAttorneyReview = z.infer<typeof insertAttorneyReviewSchema>;

// Admin configuration tables
export const adminConfig = pgTable("admin_config", {
  id: serial("id").primaryKey(),
  configKey: text("config_key").notNull().unique(),
  configValue: jsonb("config_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminPages = pgTable("admin_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  metaDescription: text("meta_description"),
  isPublished: boolean("is_published").default(true),
  showInFooter: boolean("show_in_footer").default(false),
  footerCategory: text("footer_category"),
  pageType: text("page_type").notNull().default("custom"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminPrompts = pgTable("admin_prompts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  promptContent: text("prompt_content").notNull(),
  isActive: boolean("is_active").default(true),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminConfigSchema = createInsertSchema(adminConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminPageSchema = createInsertSchema(adminPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminPromptSchema = createInsertSchema(adminPrompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AdminConfig = typeof adminConfig.$inferSelect;
export type InsertAdminConfig = z.infer<typeof insertAdminConfigSchema>;

export type AdminPage = typeof adminPages.$inferSelect;
export type InsertAdminPage = z.infer<typeof insertAdminPageSchema>;

export type AdminPrompt = typeof adminPrompts.$inferSelect;
export type InsertAdminPrompt = z.infer<typeof insertAdminPromptSchema>;
