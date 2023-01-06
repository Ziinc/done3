alter table "public"."counters" add column "notes" text;

create or replace view "public"."view_counters" as  SELECT c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.user_id,
    count(e.id) AS count,
    c.sort_index,
    c.target,
    c.notes
   FROM (counters c
     LEFT JOIN counter_events e ON ((e.counter_id = c.id)))
  GROUP BY c.id, c.name, c.created_at, c.updated_at, c.user_id, c.sort_index, c.target, c.notes;



