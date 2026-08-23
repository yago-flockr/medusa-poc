import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260822020500 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop constraint if exists "vendor_shopify_store_domain_unique";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_shopify_store_domain_unique" ON "vendor" ("shopify_store_domain") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_vendor_shopify_store_domain_unique";`);
  }

}
