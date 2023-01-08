alter table "public"."counter_events" drop constraint "counter_events_counter_id_fkey";

alter table "public"."counter_events" add constraint "counter_events_counter_id_fkey" FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE not valid;

alter table "public"."counter_events" validate constraint "counter_events_counter_id_fkey";


