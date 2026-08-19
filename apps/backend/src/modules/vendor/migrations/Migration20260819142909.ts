import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260819142909 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "is_active" boolean not null default true;`);

    this.addSql(`alter table if exists "vendor_user" add column if not exists "is_active" boolean not null default true;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "is_active";`);

    this.addSql(`alter table if exists "vendor_user" drop column if exists "is_active";`);
  }

}
