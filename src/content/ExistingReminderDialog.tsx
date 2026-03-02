import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Reminder, TweetData } from "@/shared/types";

function formatReminderTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today at ${timeStr}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeStr}`;
  }
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
}

interface ExistingReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: Reminder;
  tweetData: TweetData;
  onCancel: () => void;
  onChangeTime: () => void;
  container?: HTMLElement | null;
}

export function ExistingReminderDialog({
  open,
  onOpenChange,
  reminder,
  onCancel,
  onChangeTime,
  container,
}: ExistingReminderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        container={container}
        aria-describedby={undefined}
        className="bg-card border-border max-w-[300px] gap-3 p-5"
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base">Reminder already set</DialogTitle>
          <DialogDescription>
            {formatReminderTime(reminder.reminderTime)}
            {reminder.authorHandle && (
              <span className="text-muted-foreground/60">
                {" "}&middot; {reminder.authorHandle}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-1.5">
          <Button size="sm" variant="outline" onClick={onChangeTime}>
            Change time
          </Button>
          <Button size="sm" variant="destructive" onClick={onCancel}>
            Delete reminder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
