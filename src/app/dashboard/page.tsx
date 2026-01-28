import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserTasks, TaskPriority } from "@/lib/tasks";
import { signOut } from "@/app/(auth)/actions";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { SummarizeButton } from "@/components/tasks/summarize-button";
import { TaskActions } from "@/components/tasks/task-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

// Helper for status badge colors
const getPriorityBadgeVariant = (priority: TaskPriority) => {
  switch (priority) {
    case 3:
      return "destructive"; // High
    case 2:
      return "default"; // Medium
    default:
      return "secondary"; // Low
  }
};

const getPriorityLabel = (priority: TaskPriority) => {
  switch (priority) {
    case 3:
      return "High";
    case 2:
      return "Medium";
    default:
      return "Low";
  }
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tasks = await getUserTasks();

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.email}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <CreateTaskDialog />
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Task List */}
      <main>
        <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>

        {tasks.length === 0 ? (
          <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
            No tasks found. Create one to get started!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium leading-none">
                      {task.title}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(task.created_at).toISOString().slice(0, 10)}
                    </span>
                  </div>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-2">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[40px]">
                    {task.description || "No description provided."}
                  </p>

                  {/* AI Summary Section */}
                  <div className="mb-4">
                    {task.ai_summary ? (
                      <div className="bg-muted/50 p-3 rounded-md border text-sm animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-1 text-primary">
                          <Sparkles className="h-3 w-3" />
                          <span className="text-xs font-semibold">
                            AI Summary
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {task.ai_summary}
                        </p>
                      </div>
                    ) : (
                      <SummarizeButton taskId={task.id} />
                    )}
                  </div>

                  {/* Actions & Status - Pushed to bottom */}
                  <div className="mt-auto">
                    <TaskActions taskId={task.id} currentStatus={task.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
