CREATE TABLE "access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"src_room_id" integer NOT NULL,
	"dst_room_id" integer NOT NULL,
	"sid" integer NOT NULL,
	"action" varchar(32) NOT NULL,
	"ip_address" varchar(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_logs_action_unique" UNIQUE("action"),
	CONSTRAINT "access_logs_ip_address_unique" UNIQUE("ip_address")
);
--> statement-breakpoint
CREATE TABLE "room_adjacency" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"adj_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rooms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(24) NOT NULL,
	"is_restricted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "rooms_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"token" varchar(314) NOT NULL,
	"room_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"image" varchar(42) DEFAULT 'guest.png' NOT NULL,
	"username" varchar(18) NOT NULL,
	"email" varchar(64) NOT NULL,
	"password_hash" varchar(64) NOT NULL,
	"role" varchar(10) DEFAULT 'guest' NOT NULL,
	"sudo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_src_room_id_rooms_id_fk" FOREIGN KEY ("src_room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_dst_room_id_rooms_id_fk" FOREIGN KEY ("dst_room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_sid_sessions_id_fk" FOREIGN KEY ("sid") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_adjacency" ADD CONSTRAINT "room_adjacency_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_adjacency" ADD CONSTRAINT "room_adjacency_adj_id_rooms_id_fk" FOREIGN KEY ("adj_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;