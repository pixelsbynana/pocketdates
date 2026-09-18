"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setPendingAction, type PendingAction } from "@/lib/pending-action";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingAction?: PendingAction;
  title?: string;
  description?: string;
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  pendingAction,
  title = "Save this for the two of you",
  description = "Create a free account to save dates, build your memory collection, and pick up right where you left off.",
}: AuthRequiredDialogProps) {
  const router = useRouter();

  function go(path: "/login" | "/signup") {
    if (pendingAction) setPendingAction(pendingAction);
    onOpenChange(false);
    router.push(`${path}?next=${encodeURIComponent(window.location.pathname)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center sm:text-left">
        <DialogHeader className="items-center sm:items-start">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Heart className="h-6 w-6" fill="currentColor" />
          </div>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" size="lg" onClick={() => go("/signup")}>
            Create a free account
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => go("/login")}
          >
            I already have an account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
