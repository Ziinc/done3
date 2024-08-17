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
        WHERE (expires_at - INTERVAL '15 minute') < NOW()
    LOOP
        
        RETURN QUERY SELECT token_rec.user_id::text, (select public.refresh_user_token(token_rec, client_id, client_secret));
    END LOOP;
END;
$function$
;


