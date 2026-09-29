ALTER TABLE "sessions" DROP CONSTRAINT "sessions_uid_users_id_fk";
--> statement-breakpoint
ALTER TABLE "access_logs" ALTER COLUMN "uid" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "access_logs" ALTER COLUMN "src_room_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "access_logs" ALTER COLUMN "dst_room_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "access_logs" ALTER COLUMN "sid" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "room_adjacency" ALTER COLUMN "adj_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "uid" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;