CREATE TYPE "public"."adoption_stage" AS ENUM('novo', 'triagem', 'entrevista', 'visita', 'aprovado', 'adotado', 'pos_adocao', 'recusado', 'desistiu');--> statement-breakpoint
CREATE TYPE "public"."animal_sex" AS ENUM('macho', 'femea', 'indefinido');--> statement-breakpoint
CREATE TYPE "public"."animal_species" AS ENUM('cao', 'gato');--> statement-breakpoint
CREATE TYPE "public"."animal_status" AS ENUM('disponivel', 'em_tratamento', 'em_processo', 'adotado', 'indisponivel');--> statement-breakpoint
CREATE TYPE "public"."donation_type" AS ENUM('dinheiro', 'racao', 'medicamento', 'material', 'outro');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('nota', 'ligacao', 'whatsapp', 'email', 'visita', 'mudanca_etapa');--> statement-breakpoint
CREATE TYPE "public"."inventory_category" AS ENUM('racao', 'medicamento', 'higiene', 'limpeza', 'acessorio', 'outro');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('pix', 'dinheiro', 'transferencia', 'cartao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."request_source" AS ENUM('site', 'whatsapp', 'instagram', 'evento', 'outro');--> statement-breakpoint
CREATE TYPE "public"."transaction_kind" AS ENUM('receita', 'despesa');--> statement-breakpoint
CREATE TYPE "public"."treatment_status" AS ENUM('agendado', 'realizado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."treatment_type" AS ENUM('vacina', 'vermifugo', 'castracao', 'consulta', 'medicacao', 'cirurgia', 'exame', 'outro');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'voluntario', 'financeiro');--> statement-breakpoint
CREATE TABLE "adopters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"city" text,
	"housing_type" text,
	"has_other_pets" boolean,
	"notes" text,
	"consent_lgpd" boolean DEFAULT false NOT NULL,
	"consent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adoption_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"adopter_id" integer NOT NULL,
	"animal_id" integer,
	"stage" "adoption_stage" DEFAULT 'novo' NOT NULL,
	"source" "request_source" DEFAULT 'site' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"assigned_to" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"goal_amount" numeric(12, 2),
	"start_date" date NOT NULL,
	"end_date" date,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_name" text,
	"donor_email" text,
	"donor_phone" text,
	"type" "donation_type" DEFAULT 'dinheiro' NOT NULL,
	"amount" numeric(12, 2),
	"description" text DEFAULT '' NOT NULL,
	"method" "payment_method",
	"campaign_id" integer,
	"received_at" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"user_id" integer,
	"type" "interaction_type" DEFAULT 'nota' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "inventory_category" DEFAULT 'outro' NOT NULL,
	"unit" text DEFAULT 'un' NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"min_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"type" "movement_type" NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"date" date NOT NULL,
	"donation_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "transaction_kind" NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	"donation_id" integer,
	"treatment_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"type" "treatment_type" NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"veterinarian" text,
	"date" date NOT NULL,
	"next_date" date,
	"cost" numeric(10, 2),
	"status" "treatment_status" DEFAULT 'realizado' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'voluntario' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"availability" text,
	"skills" text,
	"active" boolean DEFAULT true NOT NULL,
	"consent_lgpd" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "species" "animal_species" DEFAULT 'cao' NOT NULL;--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "sex" "animal_sex" DEFAULT 'indefinido' NOT NULL;--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "status" "animal_status" DEFAULT 'disponivel' NOT NULL;--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "castrated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "vaccinated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "rescued_at" date;--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "adopted_at" date;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_adopter_id_adopters_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."adopters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_animal_id_dogs_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."dogs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_request_id_adoption_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."adoption_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_treatment_id_treatments_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_animal_id_dogs_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."dogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adoption_requests_stage_idx" ON "adoption_requests" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "donations_received_idx" ON "donations" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "interactions_request_idx" ON "interactions" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_item_idx" ON "inventory_movements" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "treatments_animal_idx" ON "treatments" USING btree ("animal_id");