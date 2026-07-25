import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Normal client — frontend için
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client — sadece server action'larda kullan
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
