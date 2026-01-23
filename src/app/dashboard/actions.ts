"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { summarizeTaskText } from "@/lib/ai/gemini";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createTask(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  // Verify auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;

  if (!title) {
    return { error: "Title is required" };
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description,
    status,
    priority,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function summarizeTask(taskId: string): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  // 1. Verify Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // 2. Fetch specific task ensuring ownership
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("title, description")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !task) {
    return { error: "Task not found or access denied" };
  }

  try {
    // 3. Generate Summary via Gemini
    const summary = await summarizeTaskText({
      title: task.title,
      description: task.description,
    });

    // 4. Update Database
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ ai_summary: summary })
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: "Failed to save summary" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "AI processing failed" };
  }
}
