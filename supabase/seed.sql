-- Trigger oauth access token updating every 30 mins with 5 mins offset.
select vault.create_secret('17270902880-bd8fpdqulq8r57ohis3a7qd6605kr30t.apps.googleusercontent.com', 'google_oauth_client_id');
select vault.create_secret('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', 'google_oauth_client_secret');
