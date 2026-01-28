"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { TaskStatus } from "@/lib/tasks";
import {
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/app/dashboard/actions";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskActionsProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export function TaskActions({ taskId, currentStatus }: TaskActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleStatusChange = (value: TaskStatus) => {
    setError("");

    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, value);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      const result = await deleteTaskAction(taskId);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
      {/* Status Select */}
      <div className="flex-1">
        <Select
          disabled={isPending}
          onValueChange={(v) => handleStatusChange(v as TaskStatus)}
          defaultValue={currentStatus}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Message Inline */}
      {error && <span className="text-xs text-red-500 mr-2">{error}</span>}

      {/* Delete Button with Confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Delete task</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
