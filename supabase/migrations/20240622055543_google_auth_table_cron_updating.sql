create table "public"."google_auth" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "refresh_token" text not null,
    "access_token" text not null,
    "user_id" uuid not null default auth.uid(),
    "expires_at" timestamp with time zone,
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."google_auth" enable row level security;

CREATE UNIQUE INDEX google_auth_pkey ON public.google_auth USING btree (id);

CREATE UNIQUE INDEX google_auth_user_id_key ON public.google_auth USING btree (user_id);

alter table "public"."google_auth" add constraint "google_auth_pkey" PRIMARY KEY using index "google_auth_pkey";

alter table "public"."google_auth" add constraint "google_auth_user_id_key" UNIQUE using index "google_auth_user_id_key";

alter table "public"."google_auth" add constraint "public_google_auth_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."google_auth" validate constraint "public_google_auth_user_id_fkey";

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
    
    UPDATE google_auth
    SET 
      expires_at = to_timestamp(EXTRACT(EPOCH FROM NOW()) + (http_response->>'expires_in')::bigint) AT TIME ZONE 'UTC',
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
        WHERE (expires_at - INTERVAL '1 hour') < NOW()
    LOOP
        
        RETURN QUERY SELECT token_rec.user_id::text, (select public.refresh_user_token(token_rec, client_id, client_secret));
    END LOOP;
END;
$function$
;

grant delete on table "public"."google_auth" to "anon";

grant insert on table "public"."google_auth" to "anon";

grant references on table "public"."google_auth" to "anon";

grant select on table "public"."google_auth" to "anon";

grant trigger on table "public"."google_auth" to "anon";

grant truncate on table "public"."google_auth" to "anon";

grant update on table "public"."google_auth" to "anon";

grant delete on table "public"."google_auth" to "authenticated";

grant insert on table "public"."google_auth" to "authenticated";

grant references on table "public"."google_auth" to "authenticated";

grant select on table "public"."google_auth" to "authenticated";

grant trigger on table "public"."google_auth" to "authenticated";

grant truncate on table "public"."google_auth" to "authenticated";

grant update on table "public"."google_auth" to "authenticated";

grant delete on table "public"."google_auth" to "service_role";

grant insert on table "public"."google_auth" to "service_role";

grant references on table "public"."google_auth" to "service_role";

grant select on table "public"."google_auth" to "service_role";

grant trigger on table "public"."google_auth" to "service_role";

grant truncate on table "public"."google_auth" to "service_role";

grant update on table "public"."google_auth" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."google_auth"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Enable update for users based on email"
on "public"."google_auth"
as permissive
for update
to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


create policy "select token"
on "public"."google_auth"
as permissive
for select
to public
using ((user_id = auth.uid()));



create extension if not exists "http" with schema "extensions";

create extension if not exists "pg_cron" with schema "extensions";


grant delete on table "cron"."job" to "postgres";

grant insert on table "cron"."job" to "postgres";

grant references on table "cron"."job" to "postgres";

grant select on table "cron"."job" to "postgres";

grant trigger on table "cron"."job" to "postgres";

grant truncate on table "cron"."job" to "postgres";

grant update on table "cron"."job" to "postgres";

grant delete on table "cron"."job_run_details" to "postgres";

grant insert on table "cron"."job_run_details" to "postgres";

grant references on table "cron"."job_run_details" to "postgres";

grant select on table "cron"."job_run_details" to "postgres";

grant trigger on table "cron"."job_run_details" to "postgres";

grant truncate on table "cron"."job_run_details" to "postgres";

grant update on table "cron"."job_run_details" to "postgres";

DROP TRIGGER IF EXISTS cron_job_cache_invalidate on "cron"."job";
CREATE TRIGGER cron_job_cache_invalidate AFTER INSERT OR DELETE OR UPDATE OR TRUNCATE ON cron.job FOR EACH STATEMENT EXECUTE FUNCTION cron.job_cache_invalidate();


