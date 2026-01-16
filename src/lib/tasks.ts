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
  ai_summary: string | null;
  created_at: string;
};

export async function getUserTasks(): Promise<Task[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id,user_id,title,description,status,priority,ai_summary,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return (data ?? []) as Task[];
}
