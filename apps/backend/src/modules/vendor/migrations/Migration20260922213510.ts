import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260922213510 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "commission_rate" numeric not null default 0, add column if not exists "raw_commission_rate" jsonb not null default '{"value":"0","precision":20}';`);

    this.addSql(`alter table if exists "consignment" add column if not exists "currency_code" text not null, add column if not exists "subtotal" numeric not null, add column if not exists "commission_rate" numeric not null, add column if not exists "commission_total" numeric not null, add column if not exists "earning_total" numeric not null, add column if not exists "raw_subtotal" jsonb not null, add column if not exists "raw_commission_rate" jsonb not null, add column if not exists "raw_commission_total" jsonb not null, add column if not exists "raw_earning_total" jsonb not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "commission_rate", drop column if exists "raw_commission_rate";`);

    this.addSql(`alter table if exists "consignment" drop column if exists "currency_code", drop column if exists "subtotal", drop column if exists "commission_rate", drop column if exists "commission_total", drop column if exists "earning_total", drop column if exists "raw_subtotal", drop column if exists "raw_commission_rate", drop column if exists "raw_commission_total", drop column if exists "raw_earning_total";`);
  }

}
