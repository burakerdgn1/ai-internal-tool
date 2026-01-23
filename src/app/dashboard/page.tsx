import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserTasks } from "@/lib/tasks";
import { signOut } from "@/app/(auth)/actions";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { SummarizeButton } from "@/components/tasks/summarize-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

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
            {tasks.map((task) => {
              const priorityLabel =
                task.priority === 3
                  ? "high"
                  : task.priority === 2
                    ? "medium"
                    : "low";

              const priorityVariant =
                task.priority === 3
                  ? "destructive"
                  : task.priority === 2
                    ? "default"
                    : "secondary";
              return (
                <Card key={task.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      {task.title}
                    </CardTitle>
                    <Badge variant={priorityVariant}>{priorityLabel}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {task.description || "No description provided."}
                    </p>

                    {/* AI Summary Section */}
                    <div className="mt-2 mb-4">
                      {task.ai_summary ? (
                        <div className="bg-muted/50 p-3 rounded-md border text-sm">
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

                    <div className="mt-auto flex justify-between items-center text-xs text-muted-foreground">
                      <span className="capitalize px-2 py-1 bg-muted rounded">
                        {task.status.replace("_", " ")}
                      </span>
                      <span>
                        {new Date(task.created_at).toISOString().slice(0, 10)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
