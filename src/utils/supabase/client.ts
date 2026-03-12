import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://vqyiidwwbmtmejkgkxiw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeWlpZHd3Ym10bWVqa2dreGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDk3NDksImV4cCI6MjA4ODgyNTc0OX0.wK-zFwl-R5RN7jJTFTaG6NuR5AN9_ohNOP67S7WdmdQ"
  )
}