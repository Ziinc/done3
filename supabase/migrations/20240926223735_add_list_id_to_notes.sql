alter table "public"."notes" add column "list_id" uuid;

alter table "public"."notes" add constraint "notes_list_id_fkey" FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE SET NULL not valid;

alter table "public"."notes" validate constraint "notes_list_id_fkey";


