import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260911195328 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "storefront_content" ("id" text not null, "name" text null, "description" text null, "hero_image_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "storefront_content_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_storefront_content_deleted_at" ON "storefront_content" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "storefront_content" cascade;`);
  }

}
