import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260821184619 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "shopify_store_domain" text null, add column if not exists "shopify_access_token" text null, add column if not exists "shopify_scope" text null, add column if not exists "shopify_connected_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "shopify_store_domain", drop column if exists "shopify_access_token", drop column if exists "shopify_scope", drop column if exists "shopify_connected_at";`);
  }

}
