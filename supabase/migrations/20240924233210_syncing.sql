create table "public"."lists" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "raw" jsonb,
    "user_id" uuid default gen_random_uuid(),
    "updated_at" timestamp with time zone
);


alter table "public"."lists" enable row level security;

create table "public"."tasks" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "raw" jsonb,
    "user_id" uuid default gen_random_uuid(),
    "updated_at" timestamp with time zone,
    "list_id" uuid not null
);


alter table "public"."tasks" enable row level security;

create table "public"."user_metadata" (
    "id" bigint generated by default as identity not null,
    "notes_sync_at" timestamp with time zone,
    "tasks_sync_at" timestamp with time zone,
    "user_id" uuid not null
);


alter table "public"."user_metadata" enable row level security;

alter table "public"."notes" add column "updated_at" timestamp with time zone default now();

CREATE UNIQUE INDEX lists_pkey ON public.lists USING btree (id);

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

CREATE UNIQUE INDEX user_metadata_pkey ON public.user_metadata USING btree (id);

CREATE UNIQUE INDEX user_metadata_user_id_key ON public.user_metadata USING btree (user_id);

alter table "public"."lists" add constraint "lists_pkey" PRIMARY KEY using index "lists_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."user_metadata" add constraint "user_metadata_pkey" PRIMARY KEY using index "user_metadata_pkey";

alter table "public"."lists" add constraint "lists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."lists" validate constraint "lists_user_id_fkey";

alter table "public"."tasks" add constraint "tasks_list_id_fkey" FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_list_id_fkey";

alter table "public"."tasks" add constraint "tasks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_user_id_fkey";

alter table "public"."user_metadata" add constraint "user_metadata_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_metadata" validate constraint "user_metadata_user_id_fkey";

alter table "public"."user_metadata" add constraint "user_metadata_user_id_key" UNIQUE using index "user_metadata_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.refresh_user_token(auth_rec record, client_id text, client_secret text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    http_response JSONB;
BEGIN
    select content::json into http_response from http_post(
          'https://oauth2.googleapis.com/token',
          jsonb_build_object(
              'client_id', client_id,
              'client_secret', client_secret,
              'refresh_token', auth_rec.refresh_token,
              'grant_type', 'refresh_token'
            )
      );
    -- raise LOG 'value of a : %',   http_response #>> '{}';
    UPDATE google_auth
    SET 
      expires_at = now() +  make_interval(secs => (http_response->>'expires_in')::bigint),
      access_token = http_response->>'access_token',
      updated_at = now()
    WHERE google_auth.user_id = auth_rec.user_id and google_auth.refresh_token = auth_rec.refresh_token;
    RETURN 'OK';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_expiring_access_tokens()
 RETURNS TABLE(user_id text, result text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    token_rec RECORD;
    http_response JSONB;
    client_id TEXT;
    client_secret TEXT;
BEGIN
    select decrypted_secret
      from vault.decrypted_secrets
      where name = 'google_oauth_client_id'
      limit 1 into client_id;

    select decrypted_secret
      from vault.decrypted_secrets
      where name = 'google_oauth_client_secret'
      limit 1 into client_secret;

    FOR token_rec IN
        SELECT t.user_id, t.refresh_token, t.expires_at
        FROM google_auth t
        -- WHERE (expires_at - INTERVAL '15 minute') < NOW()
    LOOP
        
        RETURN QUERY SELECT token_rec.user_id::text, (select public.refresh_user_token(token_rec, client_id, client_secret));
    END LOOP;
END;
$function$
;

grant delete on table "public"."lists" to "anon";

grant insert on table "public"."lists" to "anon";

grant references on table "public"."lists" to "anon";

grant select on table "public"."lists" to "anon";

grant trigger on table "public"."lists" to "anon";

grant truncate on table "public"."lists" to "anon";

grant update on table "public"."lists" to "anon";

grant delete on table "public"."lists" to "authenticated";

grant insert on table "public"."lists" to "authenticated";

grant references on table "public"."lists" to "authenticated";

grant select on table "public"."lists" to "authenticated";

grant trigger on table "public"."lists" to "authenticated";

grant truncate on table "public"."lists" to "authenticated";

grant update on table "public"."lists" to "authenticated";

grant delete on table "public"."lists" to "service_role";

grant insert on table "public"."lists" to "service_role";

grant references on table "public"."lists" to "service_role";

grant select on table "public"."lists" to "service_role";

grant trigger on table "public"."lists" to "service_role";

grant truncate on table "public"."lists" to "service_role";

grant update on table "public"."lists" to "service_role";

grant delete on table "public"."tasks" to "anon";

grant insert on table "public"."tasks" to "anon";

grant references on table "public"."tasks" to "anon";

grant select on table "public"."tasks" to "anon";

grant trigger on table "public"."tasks" to "anon";

grant truncate on table "public"."tasks" to "anon";

grant update on table "public"."tasks" to "anon";

grant delete on table "public"."tasks" to "authenticated";

grant insert on table "public"."tasks" to "authenticated";

grant references on table "public"."tasks" to "authenticated";

grant select on table "public"."tasks" to "authenticated";

grant trigger on table "public"."tasks" to "authenticated";

grant truncate on table "public"."tasks" to "authenticated";

grant update on table "public"."tasks" to "authenticated";

grant delete on table "public"."tasks" to "service_role";

grant insert on table "public"."tasks" to "service_role";

grant references on table "public"."tasks" to "service_role";

grant select on table "public"."tasks" to "service_role";

grant trigger on table "public"."tasks" to "service_role";

grant truncate on table "public"."tasks" to "service_role";

grant update on table "public"."tasks" to "service_role";

grant delete on table "public"."user_metadata" to "anon";

grant insert on table "public"."user_metadata" to "anon";

grant references on table "public"."user_metadata" to "anon";

grant select on table "public"."user_metadata" to "anon";

grant trigger on table "public"."user_metadata" to "anon";

grant truncate on table "public"."user_metadata" to "anon";

grant update on table "public"."user_metadata" to "anon";

grant delete on table "public"."user_metadata" to "authenticated";

grant insert on table "public"."user_metadata" to "authenticated";

grant references on table "public"."user_metadata" to "authenticated";

grant select on table "public"."user_metadata" to "authenticated";

grant trigger on table "public"."user_metadata" to "authenticated";

grant truncate on table "public"."user_metadata" to "authenticated";

grant update on table "public"."user_metadata" to "authenticated";

grant delete on table "public"."user_metadata" to "service_role";

grant insert on table "public"."user_metadata" to "service_role";

grant references on table "public"."user_metadata" to "service_role";

grant select on table "public"."user_metadata" to "service_role";

grant trigger on table "public"."user_metadata" to "service_role";

grant truncate on table "public"."user_metadata" to "service_role";

grant update on table "public"."user_metadata" to "service_role";

create policy "Access by user_id"
on "public"."lists"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Restrict operations for users based on user_id"
on "public"."tasks"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = user_id));



