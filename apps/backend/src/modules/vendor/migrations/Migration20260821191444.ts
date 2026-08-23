import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260821191444 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "shopify_client_id" text null, add column if not exists "shopify_client_secret" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "shopify_client_id", drop column if exists "shopify_client_secret";`);
  }

}
