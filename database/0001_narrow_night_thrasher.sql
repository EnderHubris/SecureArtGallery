CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"image" varchar(42) NOT NULL,
	"room_id" integer NOT NULL,
	CONSTRAINT "gallery_images_image_room_id_unique" UNIQUE("image","room_id")
);
--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;