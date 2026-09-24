import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260923183125 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_user" drop column if exists "first_name", drop column if exists "last_name";`);

    this.addSql(`alter table if exists "vendor_user" add column if not exists "name" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_user" add column if not exists "last_name" text null;`);
    this.addSql(`alter table if exists "vendor_user" rename column "name" to "first_name";`);
  }

}
