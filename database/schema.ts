import {
    pgTable, serial, varchar, timestamp,
    boolean, integer, unique, check
} from "drizzle-orm/pg-core";
import {
    sql
} from "drizzle-orm";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SESSION_LIFETIME = Number(process.env.SESSION_LIFETIME_DAYS ?? 7) * MS_PER_DAY;

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    image: varchar("image", { length: 42 }).notNull().default("guest.png"),   // user-uploaded file names are MD5 hash strings
    username: varchar("username", { length: 18 }).unique().notNull(),
    email: varchar("email", { length: 64 }).unique().notNull(),
    password_hash: varchar("password_hash", { length: 64 }).notNull(),    // SHA-256
    role: varchar("role", { length: 10 }).notNull().default("guest"),     // guest, employee, admin
    sudo: boolean("sudo").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const rooms = pgTable("rooms", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 24 }).unique().notNull(),
    is_restricted: boolean("is_restricted").default(false).notNull(),
    occupancy: integer("occupancy").default(15).notNull(),
}, (table) => [
    // enforce size restriction
    check(
        "capacity_range",
        sql`${table.occupancy} >= 15 AND ${table.occupancy} <= 75`
    ),
]);

// one room can have many adjacent rooms
export const room_adjacency = pgTable("room_adjacency", {
    id: serial("id").primaryKey(),
    room_id: integer("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
    adj_id: integer("adj_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
});

export const sessions = pgTable("sessions", {
    id: serial("id").primaryKey(),
    uid: integer("uid").references(() => users.id, { onDelete: "cascade" }).notNull(),
    token: varchar("token", { length: 314 }).notNull(), // JWT
    room_id: integer("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(), // room this session is actively in
    created_at: timestamp("created_at").defaultNow().notNull(),
    expires_at: timestamp("expires_at").notNull().$defaultFn(() => new Date(Date.now() + SESSION_LIFETIME))
});

export const access_logs = pgTable("access_logs", {
    id: serial("id").primaryKey(),

    uid: integer("uid").references(() => users.id).notNull(),
    src_room_id: integer("src_room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
    dst_room_id: integer("dst_room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
    sid: integer("sid").references(() => sessions.id).notNull(),
    
    action: varchar("action", { length: 32 }).unique().notNull(), // @todo - declare a list of actions
    ip_address: varchar("ip_address", { length: 24 }).unique().notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export const galleryImages = pgTable("gallery_images", {
    id: serial("id").primaryKey(),
    image: varchar("image", { length: 42 }).notNull(),   // user-uploaded file names are MD5 hash strings
    room_id: integer("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull() // room the image belongs to
}, (table) => [
    unique().on(table.image, table.room_id),
]);
