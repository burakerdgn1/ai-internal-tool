import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserTasks, TaskPriority } from "@/lib/tasks";
import { getUserNotes } from "@/lib/notes";
import { signOut } from "@/app/(auth)/actions";

// Components
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { SummarizeButton } from "@/components/tasks/summarize-button";
import { TaskActions } from "@/components/tasks/task-actions";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { CreateNoteDialog } from "@/components/notes/create-note-dialog";

// UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, Code } from "lucide-react";

// Helper for status badge colors (Tasks)
const getPriorityBadgeVariant = (priority: TaskPriority) => {
  switch (priority) {
    case 3:
      return "destructive";
    case 2:
      return "default";
    default:
      return "secondary";
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

  // Parallel data fetching for performance
  const [tasks, notes] = await Promise.all([getUserTasks(), getUserNotes()]);

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
        <div>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main>
        <Tabs defaultValue="tasks" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Context-aware actions could go here, but we keep dialogs specific to tabs for now 
                or render the specific dialog based on active tab if we used client state.
                For simplicity, we put the "New" buttons inside the TabContent or header. 
                Here, I'll place them inside the content area for clear separation.
            */}
          </div>

          {/* TASKS TAB */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-end">
              <CreateTaskDialog />
            </div>

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
                          {new Date(task.created_at).toLocaleDateString()}
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

                      <div className="mt-auto">
                        <TaskActions
                          taskId={task.id}
                          currentStatus={task.status}
                        >
                          <EditTaskDialog
                            taskId={task.id}
                            initialTitle={task.title}
                            initialDescription={task.description}
                          />
                        </TaskActions>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-end">
              <CreateNoteDialog />
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                No notes found. Jot something down!
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {notes.map((note) => (
                  <Card
                    key={note.id}
                    className="flex flex-col bg-amber-50/50 dark:bg-zinc-900/50"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {note.is_technical ? (
                            <Code className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="text-xs">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {note.is_technical && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 border-blue-200 text-blue-700 dark:text-blue-400 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10"
                          >
                            Technical
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap line-clamp-6 leading-relaxed">
                        {note.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
