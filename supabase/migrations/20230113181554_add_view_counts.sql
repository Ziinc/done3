create or replace view "public"."view_counts" as  SELECT c.id,
    sum(
        CASE
            WHEN (e.created_at > (now() - '1 day'::interval)) THEN COALESCE((e.value)::integer, 0)
            ELSE 0
        END) AS sum_1_day,
    sum(
        CASE
            WHEN (e.created_at > (now() - '3 days'::interval)) THEN COALESCE((e.value)::integer, 0)
            ELSE 0
        END) AS sum_3_day,
    sum(
        CASE
            WHEN (e.created_at > (now() - '7 days'::interval)) THEN COALESCE((e.value)::integer, 0)
            ELSE 0
        END) AS sum_7_day,
    sum(
        CASE
            WHEN (e.created_at > (now() - '30 days'::interval)) THEN COALESCE((e.value)::integer, 0)
            ELSE 0
        END) AS sum_30_day,
    sum(
        CASE
            WHEN (e.created_at > (now() - '90 days'::interval)) THEN COALESCE((e.value)::integer, 0)
            ELSE 0
        END) AS sum_90_day,
    sum(COALESCE((e.value)::integer, 0)) AS sum_lifetime
   FROM (counters c
     LEFT JOIN counter_events e ON ((e.counter_id = c.id)))
  GROUP BY c.id;



