CREATE TABLE IF NOT EXISTS "Users" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" text NOT NULL DEFAULT 'financial_staff',
  "department" text,
  "phone" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
