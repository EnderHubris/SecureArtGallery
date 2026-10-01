ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_ip_address_unique";--> statement-breakpoint
ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_sid_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "access_logs" DROP COLUMN "sid";