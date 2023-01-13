alter table "public"."counters" add column "tally_method" character varying not null default 'sum_7_day'::character varying;


