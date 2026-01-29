"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { ActionState, createNote } from "@/app/dashboard/actions";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: ActionState = { error: "", success: false };

export function CreateNoteDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(createNote, initialState);

  const [formKey, setFormKey] = useState(0);
  const [lastSuccessKey, setLastSuccessKey] = useState<number | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setFormKey((k) => k + 1);
      setLastSuccessKey(null); // ✅ dialog kapanınca success mesajını sıfırla
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
          <DialogDescription>
            Add a quick note or technical memo.
          </DialogDescription>
        </DialogHeader>

        <form
          key={formKey}
          action={action}
          onSubmit={() => setLastSuccessKey(formKey)}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              required
              placeholder="Jot down something..."
              className="resize-none min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* 
               Shadcn/Radix Checkbox supports 'name' prop which injects a hidden input 
               so FormData can capture it. 
            */}
            <Checkbox id="is_technical" name="is_technical" />
            <Label
              htmlFor="is_technical"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Technical Note
            </Label>
          </div>

          {state.error && (
            <p className="text-sm text-red-500 font-medium">{state.error}</p>
          )}
          {state.success && lastSuccessKey === formKey && (
            <p className="text-sm text-green-600">
              Saved. You can close this dialog.
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
