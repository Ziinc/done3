
start:
	npm run sb:start --prefix=web
	npm run dev --prefix=web

diff:
	supabase db diff -f $(f) -s public,extensions --local


deploy:
	@echo 'Deploying DB migrations now'
	@supabase db push
	@echo 'Deploying functions now'
	@find ./supabase/functions/* -type d ! -name '_*'  | xargs -I {} basename {} | xargs -I {} supabase functions deploy {}

.PHONY: start diff deploy
