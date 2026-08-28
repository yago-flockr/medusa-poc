import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260828155825 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "vendor_integration_connection" ("id" text not null, "provider" text not null, "external_account_identifier" text null, "client_id" text null, "client_secret" text null, "access_token" text null, "scope" text null, "connected_at" timestamptz null, "oauth_state" text null, "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_integration_connection_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_integration_connection_vendor_id" ON "vendor_integration_connection" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_integration_connection_deleted_at" ON "vendor_integration_connection" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_integration_connection" add constraint "vendor_integration_connection_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);

    this.addSql(`drop index if exists "IDX_vendor_shopify_store_domain_unique";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "shopify_store_domain", drop column if exists "shopify_client_id", drop column if exists "shopify_client_secret", drop column if exists "shopify_access_token", drop column if exists "shopify_scope", drop column if exists "shopify_connected_at", drop column if exists "shopify_oauth_state";`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_integration_connection" cascade;`);

    this.addSql(`alter table if exists "vendor" add column if not exists "shopify_store_domain" text null, add column if not exists "shopify_client_id" text null, add column if not exists "shopify_client_secret" text null, add column if not exists "shopify_access_token" text null, add column if not exists "shopify_scope" text null, add column if not exists "shopify_connected_at" timestamptz null, add column if not exists "shopify_oauth_state" text null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_shopify_store_domain_unique" ON "vendor" ("shopify_store_domain") WHERE deleted_at IS NULL;`);
  }

}
