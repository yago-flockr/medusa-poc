import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260923153246 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "referral" add column if not exists "currency_code" text not null, add column if not exists "subtotal" numeric not null, add column if not exists "commission_total" numeric not null, add column if not exists "raw_subtotal" jsonb not null, add column if not exists "raw_commission_total" jsonb not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "referral" drop column if exists "currency_code", drop column if exists "subtotal", drop column if exists "commission_total", drop column if exists "raw_subtotal", drop column if exists "raw_commission_total";`);
  }

}
