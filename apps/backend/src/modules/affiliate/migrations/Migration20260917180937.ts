import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260917180937 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "referral" rename column "code" to "affiliate_handle";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "referral" rename column "affiliate_handle" to "code";`);
  }

}
