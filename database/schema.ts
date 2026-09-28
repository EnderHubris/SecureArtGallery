import {
    pgTable, serial, varchar, timestamp,
    boolean
} from "drizzle-orm/pg-core";

const SESSION_LIFETIME = Number(process.env.SESSION_LIFETIME_SECONDS ?? 3600);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    image: varchar("image", { length: 32 }).notNull().default("guest"),   // user-uploaded file names are MD5 hash strings
    username: varchar("username", { length: 18 }).unique().notNull(),
    email: varchar("email", { length: 64 }).unique().notNull(),
    password_hash: varchar("password_hash", { length: 64 }).notNull(),    // SHA-256
    role: varchar("role", { length: 10 }).notNull().default("guest"),     // guest, employee, admin
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const rooms = pgTable("rooms", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 24 }).unique().notNull(),
    is_restricted: boolean("is_restricted").default(false).notNull()
});
// one room can have many adjacent rooms
export const room_adjacency = pgTable("room_adjacency", {
    id: serial("id").primaryKey(),
    adj_id: serial("adj_id").references(() => rooms.id).notNull(),
});

export const sessions = pgTable("sessions", {
    id: serial("id").primaryKey(),
    uid: serial("uid").references(() => users.id).notNull(),
    token: varchar("token", { length: 314 }).notNull(), // JWT
    created_at: timestamp("created_at").defaultNow().notNull(),
    expires_at: timestamp("expires_at").notNull().$defaultFn(() => new Date(Date.now() + SESSION_LIFETIME * 1000))
});

export const access_logs = pgTable("access_logs", {
    id: serial("id").primaryKey(),

    uid: serial("uid").references(() => users.id).notNull(),
    src_room_id: serial("src_room_id").references(() => rooms.id).notNull(),
    dst_room_id: serial("dst_room_id").references(() => rooms.id).notNull(),
    sid: serial("sid").references(() => sessions.id).notNull(),
    
    action: varchar("action", { length: 32 }).unique().notNull(), // @todo - declare a list of actions
    ip_address: varchar("ip_address", { length: 24 }).unique().notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});