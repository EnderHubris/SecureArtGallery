/**
 * Schema Design is not finalized!
 */

import { relations } from "drizzle-orm";
import {
    pgTable, serial, integer, varchar, timestamp, text
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 18 }).unique().notNull(),
    password: varchar("password", { length: 64 }).notNull(),    // SHA-256
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 24 }).unique().notNull(),
    desc: varchar("desc", { length: 100 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});