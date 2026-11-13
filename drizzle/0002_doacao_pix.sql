CREATE TYPE "public"."donation_status" AS ENUM('pendente', 'confirmada', 'recusada');--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "status" "donation_status" DEFAULT 'confirmada' NOT NULL;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "pix_txid" text;--> statement-breakpoint
CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");