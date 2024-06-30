diff:
	supabase db diff -f $(f) -s public,extensions --local

build.app:
	npm run build --prefix=web
build.docs:
	npm run build --prefix=docs

.PHONY: build.app