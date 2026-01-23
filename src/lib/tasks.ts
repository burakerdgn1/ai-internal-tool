import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number; // 1|2|3
  created_at: string;
  ai_summary: string | null;
};

export async function getUserTasks() {
  const supabase = await createSupabaseServerClient();

  // RLS ensures we only get our own tasks
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data as Task[];
}
