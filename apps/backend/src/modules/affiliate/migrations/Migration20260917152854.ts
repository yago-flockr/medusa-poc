import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260917152854 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "referral" ("id" text not null, "code" text not null, "commission_rate" numeric not null, "affiliate_id" text not null, "raw_commission_rate" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "referral_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_affiliate_id" ON "referral" ("affiliate_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_deleted_at" ON "referral" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "referral" add constraint "referral_affiliate_id_foreign" foreign key ("affiliate_id") references "affiliate" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "referral" cascade;`);
  }

}
