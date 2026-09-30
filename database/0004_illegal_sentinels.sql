ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_src_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_dst_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "room_adjacency" DROP CONSTRAINT "room_adjacency_adj_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_src_room_id_rooms_id_fk" FOREIGN KEY ("src_room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_dst_room_id_rooms_id_fk" FOREIGN KEY ("dst_room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_adjacency" ADD CONSTRAINT "room_adjacency_adj_id_rooms_id_fk" FOREIGN KEY ("adj_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;