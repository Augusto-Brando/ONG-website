CREATE TABLE "dogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"breed" text DEFAULT 'Vira-lata' NOT NULL,
	"age" text NOT NULL,
	"weight" text,
	"description" text DEFAULT '' NOT NULL,
	"observations" text,
	"image_url" text DEFAULT '' NOT NULL,
	"color" text DEFAULT '#F97316' NOT NULL,
	"images" text[] DEFAULT '{}',
	"available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_image_url" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
