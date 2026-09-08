import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260907205150 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "consignment" ("id" text not null, "status" text check ("status" in ('placed', 'accepted', 'dispatched')) not null default 'placed', "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "consignment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_consignment_vendor_id" ON "consignment" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_consignment_deleted_at" ON "consignment" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "consignment" add constraint "consignment_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "consignment" cascade;`);
  }

}
