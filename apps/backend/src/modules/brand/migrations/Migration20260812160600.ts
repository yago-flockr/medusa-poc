import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260812160600 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "brand" add column if not exists "handle" text null;`,
    )
    this.addSql(`update "brand" set "handle" = "id" where "handle" is null;`)
    this.addSql(
      `alter table if exists "brand" alter column "handle" set not null;`,
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_brand_handle_unique" ON "brand" ("handle") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_brand_handle_unique";`)
    this.addSql(`alter table if exists "brand" drop column if exists "handle";`)
  }
}
