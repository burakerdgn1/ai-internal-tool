import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Note = {
  id: string;
  user_id: string;
  content: string;
  is_technical: boolean;
  created_at: string;
};

export type NoteFilterOptions = {
  search?: string;
  type?: "all" | "technical" | "non_technical";
  sort?: "newest" | "oldest";
};

export async function getUserNotes(options: NoteFilterOptions = {}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("notes").select("*");

  // 1. Search (Content)
  if (options.search && options.search.trim()) {
    const term = options.search.trim();
    query = query.ilike("content", `%${term}%`);
  }

  // 2. Filter by Type
  if (options.type === "technical") {
    query = query.eq("is_technical", true);
  } else if (options.type === "non_technical") {
    query = query.eq("is_technical", false);
  }
  // if 'all' or undefined, no filter applied

  // 3. Sort
  const ascending = options.sort === "oldest";
  query = query.order("created_at", { ascending });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  return data as Note[];
}
