import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260917144504 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "affiliate" drop constraint if exists "affiliate_email_unique";`);
    this.addSql(`alter table if exists "affiliate" drop constraint if exists "affiliate_handle_unique";`);
    this.addSql(`create table if not exists "affiliate" ("id" text not null, "name" text not null, "handle" text not null, "email" text not null, "commission_rate" numeric not null, "is_active" boolean not null default true, "raw_commission_rate" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_handle_unique" ON "affiliate" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_email_unique" ON "affiliate" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_deleted_at" ON "affiliate" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "affiliate" cascade;`);
  }

}
