"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { answerFromNotes, summarizeTaskText } from "@/lib/ai/gemini";
import { TaskPriority, TaskStatus } from "@/lib/tasks";
import { Note } from "@/lib/notes";

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
  const rawDescription = formData.get("description") as string;
  const description = rawDescription?.trim() ? rawDescription.trim() : null;
  const status = formData.get("status") as TaskStatus;
  const priority = Number(formData.get("priority")) as TaskPriority;

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

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTaskAction(
  taskId: string,
  data: { title: string; description: string | null },
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = data.title.trim();
  // Normalize description: empty string becomes null
  const description = data.description?.trim() || null;

  if (!title) {
    return { error: "Title cannot be empty" };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      ai_summary: null,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTaskAction(taskId: string): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function createNote(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const content = formData.get("content") as string;
  // Checkbox value is 'on' if checked, null if not
  const isTechnical = formData.get("is_technical") === "on";

  if (!content || content.trim() === "") {
    return { error: "Content is required" };
  }

  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    content: content.trim(),
    is_technical: isTechnical,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateNoteAction(
  noteId: string,
  data: { content: string; is_technical: boolean },
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const content = (data.content ?? "").trim();

  if (!content) {
    return { error: "Content cannot be empty" };
  }

  const { error } = await supabase
    .from("notes")
    .update({
      content,
      is_technical: data.is_technical,
    })
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteNoteAction(noteId: string): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function askNotesAI(question: string) {
  const supabase = await createSupabaseServerClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // 2. Validate Question
  const trimmedQuestion = question.trim();
  if (trimmedQuestion.length < 5 || trimmedQuestion.length > 300) {
    return { error: "Question must be between 5 and 300 characters." };
  }

  try {
    // 3. Simple Keyword Extraction (Simple RAG)
    // Split by space, remove punctuation, filter words >= 4 chars, take top 2
    const keywords = trimmedQuestion
      .replace(/[^\w\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length >= 4)
      .slice(0, 2);

    // 4. Fetching Data
    // We run two queries: specific keyword matches and recent notes to ensure context
    const promises = [];

    // A) Keyword Search (if keywords exist)
    if (keywords.length > 0) {
      // Create an OR string like: content.ilike.%word1%,content.ilike.%word2%
      const orQuery = keywords.map((k) => `content.ilike.%${k}%`).join(",");
      promises.push(
        supabase
          .from("notes")
          .select("id, content, is_technical, created_at")
          .eq("user_id", user.id)
          .or(orQuery)
          .limit(10),
      );
    }

    // B) Recent Notes (Fallback/Supplement)
    promises.push(
      supabase
        .from("notes")
        .select("id, content, is_technical, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    );

    const results = await Promise.all(promises);

    // 5. Merge and Deduplicate
    const allNotes: Note[] = [];
    const seenIds = new Set<string>();

    // Flatten results (handle whether we had 1 or 2 queries)
    results.forEach((res) => {
      if (res.data) {
        res.data.forEach((note: any) => {
          if (!seenIds.has(note.id)) {
            seenIds.add(note.id);
            allNotes.push(note as Note);
          }
        });
      }
    });

    // Take top 10 unique notes
    const contextNotes = allNotes.slice(0, 10);

    if (contextNotes.length === 0) {
      return {
        answer: "You don't have any notes yet to answer this question.",
        usedNotes: [],
      };
    }

    // 6. Call Gemini
    const answer = await answerFromNotes(trimmedQuestion, contextNotes);

    return {
      answer,
      usedNotes: contextNotes.map((n) => ({
        id: n.id,
        content: n.content,
        is_technical: n.is_technical,
        created_at: n.created_at,
      })),
    };
  } catch (err) {
    console.error("Ask AI Error:", err);
    return { error: "Failed to process your question. Please try again." };
  }
}
