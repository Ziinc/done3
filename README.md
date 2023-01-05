## Development Process

1. Make changes in local studio
2. Diff changes to migration file
   ```
   supabase db diff -f <migration_name>
   ```
3. Create a remote commit to diff additional changes between remote and local
   ```
   supabase db remote commit
   ```
4. push changes
   ```
   supabase db push
   ```
