import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    "https://vqyiidwwbmtmejkgkxiw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeWlpZHd3Ym10bWVqa2dreGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDk3NDksImV4cCI6MjA4ODgyNTc0OX0.wK-zFwl-R5RN7jJTFTaG6NuR5AN9_ohNOP67S7WdmdQ",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}