import { createClient } from "@supabase/supabase-js"

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

export async function syncToSupabase(data: any) {
  try {
    const supabase = getSupabase()
    if (!supabase) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from("user_data")
      .upsert({ user_id: user.id, data, updated_at: new Date().toISOString() } as any)

    return !error
  } catch {
    return false
  }
}

export async function loadFromSupabase() {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await (supabase
      .from("user_data") as any)
      .select("data")
      .eq("user_id", user.id)
      .single()

    if (error) return null
    return data?.data || null
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}
