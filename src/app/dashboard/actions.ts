"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskPriority, TaskStatus } from "@/lib/tasks";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "TODO" || value === "IN_PROGRESS" || value === "DONE" || value === "ARCHIVED";
}

function toPriority(value: unknown): TaskPriority | null {
  const n = Number(value);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

export async function createTask(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const title = String(formData.get("title") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const statusRaw = formData.get("status");
  const priorityRaw = formData.get("priority");

  if (!title) return { error: "Title is required" };

  if (!isTaskStatus(statusRaw)) {
    return { error: "Invalid status" };
  }

  const priority = toPriority(priorityRaw);
  if (!priority) {
    return { error: "Invalid priority" };
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description: descriptionRaw ? descriptionRaw : null,
    status: statusRaw,
    priority,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
