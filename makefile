
start:
	npm run sb:start --prefix=web
	npm run dev --prefix=web

diff:
	supabase db diff -f $(f) -s public,extensions --local

build.app:
	npm run build --prefix=web
build.docs:
	npm run build --prefix=docs

.PHONY: build.app start