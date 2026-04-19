import { createClient } from '@supabase/supabase-js'

// Bunlar .env.local dosyasındaki değerleri okur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)