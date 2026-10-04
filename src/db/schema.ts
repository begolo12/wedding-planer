import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Tabel milik Better Auth. Bentuk kolom mengikuti yang diminta pustakanya,
// bukan pilihan kita sendiri.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verifications = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    partnerName: text("partner_name").notNull(),
    weddingDate: date("wedding_date"),
    isDayOfDate: date("is_day_of_date"),
    status: text("status").notNull().default("perencanaan"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("plans_user_idx").on(t.userId, t.deletedAt)],
);

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    eventDate: date("event_date").notNull(),
    eventTime: time("event_time"),
    type: text("type").notNull().default("lainnya"),
    isDayOf: boolean("is_day_of").notNull().default(false),
    // Tautan undangan digital untuk acara ini, dari docs/02b-Tamu.md bagian
    // 06. Nullable karena banyak acara tidak punya undangan sendiri.
    invitationUrl: text("invitation_url"),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("milestones_plan_date_idx").on(t.planId, t.eventDate)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull().default("Pelengkap"),
    dueDate: date("due_date"),
    status: text("status").notNull().default("belum"),
    priority: text("priority").notNull().default("sedang"),
    assignee: text("assignee"),
    budgetItemId: uuid("budget_item_id").references(() => budgetItems.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tasks_plan_status_due_idx").on(t.planId, t.status, t.dueDate),
    index("tasks_plan_undated_idx")
      .on(t.planId, t.status)
      .where(sql`${t.dueDate} is null`),
  ],
);

export const budgetItems = pgTable(
  "budget_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull().default("lainnya"),
    plannedAmount: integer("planned_amount").notNull().default(0),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("budget_items_plan_idx").on(t.planId)],
);

export const vendors = pgTable(
  "vendors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    budgetItemId: uuid("budget_item_id").references(() => budgetItems.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    category: text("category").notNull().default("lainnya"),
    contactName: text("contact_name"),
    phone: text("phone"),
    address: text("address"),
    status: text("status").notNull().default("calon"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("vendors_plan_status_idx").on(t.planId, t.status)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull().default(0),
    paidAt: date("paid_at").notNull(),
    method: text("method").notNull().default("transfer"),
    isFinal: boolean("is_final").notNull().default(false),
    proofImageKey: text("proof_image_key"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payments_plan_idx").on(t.planId), index("payments_vendor_idx").on(t.vendorId)],
);

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    category: text("category").notNull().default("lainnya"),
    side: text("side"),
    rsvpStatus: text("rsvp_status").notNull().default("belum"),
    guestCount: integer("guest_count").notNull().default(1),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    tableName: text("table_name"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("guests_plan_rsvp_idx").on(t.planId, t.rsvpStatus)],
);

export const rundownItems = pgTable(
  "rundown_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startTime: time("start_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(15),
    location: text("location"),
    picName: text("pic_name"),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("rundown_plan_start_idx").on(t.planId, t.startTime)],
);

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    audience: text("audience").notNull().default("semua"),
    shareToken: text("share_token").notNull().unique(),
    isPinned: boolean("is_pinned").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("announcements_plan_idx").on(t.planId, t.isPinned, t.publishedAt),
    uniqueIndex("announcements_token_idx").on(t.shareToken),
  ],
);

export const outfits = pgTable(
  "outfits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    itemName: text("item_name").notNull(),
    owner: text("owner").notNull().default("pengantinWanita"),
    status: text("status").notNull().default("belum"),
    measureDate: date("measure_date"),
    pickupDate: date("pickup_date"),
    notes: text("notes"),
    estimatedCost: integer("estimated_cost"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("outfits_plan_idx").on(t.planId)],
);

// Tautan baca-saja. Dimiliki plan, bukan orang, supaya tidak hilang
// saat pasangan berganti tangan. Batas lima per plan dari 16-Laporan-dan-Bagikan.md.
export const shareLinks = pgTable(
  "share_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    label: text("label").notNull().default("Keluarga"),
    target: text("target").notNull().default("keluarga"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("share_links_plan_idx").on(t.planId),
    uniqueIndex("share_links_token_idx").on(t.token),
  ],
);
