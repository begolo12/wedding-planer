CREATE TABLE "idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" integer NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idempotency_keys_plan_idx" ON "idempotency_keys" USING btree ("plan_id","created_at");