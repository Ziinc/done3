## Development Process

1. Make changes in local studio
2. Diff changes to migration file
   ```
   supabase db diff -f <migration_name>
   ```
3. push changes
   ```
   supabase db push
   ```
4. (if there are changes on remote) Create a remote commit to diff additional changes between remote and local
   ```
   supabase db remote commit
   ```
