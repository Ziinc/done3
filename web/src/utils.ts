import { createClient } from '@supabase/supabase-js'


const supabaseUrl = import.meta.env.VITE_API_URL
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY

export const client = createClient(supabaseUrl, supabaseAnonKey)