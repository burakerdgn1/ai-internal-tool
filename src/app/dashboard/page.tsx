import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { getUserTasks, type Task } from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatStatus(status: Task["status"]) {
  if (status === "IN_PROGRESS") return "In Progress";
  return status.charAt(0) + status.slice(1).toLowerCase(); // TODO -> Todo, DONE -> Done...
}

function priorityLabel(p: Task["priority"]) {
  return p === 3 ? "High" : p === 2 ? "Medium" : "Low";
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const tasks = await getUserTasks();

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Logged in as:{" "}
            <span className="font-mono text-foreground">{user.email}</span>
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <CreateTaskDialog />
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="p-6 bg-card rounded-lg border border-dashed text-muted-foreground">
            No tasks yet. Create one to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {task.title}
                  </CardTitle>

                  <Badge
                    variant={
                      task.priority === 3
                        ? "destructive"
                        : task.priority === 2
                          ? "default"
                          : "secondary"
                    }
                  >
                    {priorityLabel(task.priority)}
                  </Badge>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {task.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="px-2 py-1 bg-muted rounded">
                      {formatStatus(task.status)}
                    </span>
                    <span>
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {task.ai_summary && (
                    <div className="mt-2 rounded-md border bg-muted/40 p-3">
                      <p className="text-xs font-medium mb-1">AI summary</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {task.ai_summary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
