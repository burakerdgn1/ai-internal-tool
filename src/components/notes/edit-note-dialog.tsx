"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import { updateNoteAction } from "@/app/dashboard/actions";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditNoteDialogProps {
  noteId: string;
  initialContent: string;
  initialIsTechnical: boolean;
}

export function EditNoteDialog({
  noteId,
  initialContent,
  initialIsTechnical,
}: EditNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Form state
  const [content, setContent] = useState(initialContent);
  const [isTechnical, setIsTechnical] = useState(initialIsTechnical);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setContent(initialContent);
      setIsTechnical(initialIsTechnical);
      setError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await updateNoteAction(noteId, {
        content,
        is_technical: isTechnical,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3 w-3" />
          <span className="sr-only">Edit note</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Update your note content below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isPending}
              className="resize-none min-h-[150px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-is-technical"
              checked={isTechnical}
              onCheckedChange={(checked) => setIsTechnical(checked === true)}
              disabled={isPending}
            />
            <Label
              htmlFor="edit-is-technical"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Technical Note
            </Label>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
