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

export async function getUserTasks() {
  const supabase = await createSupabaseServerClient();

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

// Helpers for Actions (Authentication/Authorization handles in Actions, but extra safety here is fine)
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createSupabaseServerClient();
  return await supabase.from("tasks").update({ status }).eq("id", taskId);
}

export async function deleteTask(taskId: string) {
  const supabase = await createSupabaseServerClient();
  return await supabase.from("tasks").delete().eq("id", taskId);
}
