alter table "public"."counter_events" add column "value" smallint not null default 1;

create or replace view "public"."view_counters" as  SELECT c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.user_id,
    COALESCE(sum(e.value), (0)::bigint) AS count,
    c.sort_index,
    c.target,
    c.notes
   FROM (counters c
     LEFT JOIN counter_events e ON ((e.counter_id = c.id)))
  GROUP BY c.id, c.name, c.created_at, c.updated_at, c.user_id, c.sort_index, c.target, c.notes;



