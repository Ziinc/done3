alter table "public"."counters" add column "list_id" uuid;

alter table "public"."counters" add constraint "counters_list_id_fkey" FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE SET NULL not valid;

alter table "public"."counters" validate constraint "counters_list_id_fkey";


