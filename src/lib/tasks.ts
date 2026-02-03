import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
export type TaskPriority = 1 | 2 | 3;

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  ai_summary: string | null;
};

export type TaskFilterOptions = {
  search?: string;
  status?: "all" | TaskStatus;
  sort?: "newest" | "oldest";
};

export async function getUserTasks(options: TaskFilterOptions = {}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("tasks").select("*");

  // 1. Search (Title or Description)
  if (options.search && options.search.trim()) {
    const term = options.search.trim();
    // Supabase .or() syntax for multi-column search
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  // 2. Filter by Status
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  } else {
    // Default behavior: don't show archived unless specifically asked or 'all'
    // If 'all' is explicitly requested, we show archived too.
    // If status is undefined (initial load), we usually hide archived.
    // However, requirement says "all|TODO..." - let's assume 'all' includes everything.
    if (!options.status) {
      query = query.neq("status", "ARCHIVED");
    }
  }

  // 3. Sort
  const ascending = options.sort === "oldest";
  query = query.order("created_at", { ascending });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data as Task[];
}

// ... (Keep existing helpers: updateTaskStatus, deleteTask)
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createSupabaseServerClient();
  return await supabase.from("tasks").update({ status }).eq("id", taskId);
}

export async function deleteTask(taskId: string) {
  const supabase = await createSupabaseServerClient();
  return await supabase.from("tasks").delete().eq("id", taskId);
}
