import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('EKSİK ENV VARS:', {
    url: supabaseUrl ? 'VAR' : 'YOK',
    anonKey: supabaseAnonKey ? 'VAR' : 'YOK',
  })
}

// Normal client — frontend için
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Admin client — lazy oluşturma
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase admin env variables eksik')
    }
    _supabaseAdmin = createClient(supabaseUrl, serviceKey)
  }
  return _supabaseAdmin
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>]
  }
})
