import { createSupabaseServerClient } from '@/lib/supabase/server'

export type Note = {
  id: string
  user_id: string
  content: string
  is_technical: boolean
  created_at: string
}

export async function getUserNotes() {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }

  return data as Note[]
}