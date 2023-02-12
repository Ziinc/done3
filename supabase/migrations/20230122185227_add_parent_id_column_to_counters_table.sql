alter table "public"."counters" add column "parent_id" bigint;

alter table "public"."counters" add constraint "counters_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES counters(id) not valid;

alter table "public"."counters" validate constraint "counters_parent_id_fkey";


