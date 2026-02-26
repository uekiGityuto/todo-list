import { Bell, Check, Pause, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimerEndDialogProps {
  open: boolean;
  taskName: string;
  onComplete: () => void;
  onContinue: () => void;
  onInterrupt: () => void;
}

export function TimerEndDialog({
  open,
  taskName,
  onComplete,
  onContinue,
  onInterrupt,
}: TimerEndDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-w-80 gap-5 p-7">
        <DialogHeader className="items-center gap-5">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
            <Bell className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            時間になりました！
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {taskName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5">
          <Button
            onClick={onComplete}
            className="h-12 rounded-3xl text-base font-semibold"
          >
            <Check className="size-4" />
            完了
          </Button>
          <Button
            variant="secondary"
            onClick={onContinue}
            className="h-12 rounded-3xl text-base font-semibold"
          >
            <RotateCw className="size-4" />
            継続する
          </Button>
          <Button
            variant="outline"
            onClick={onInterrupt}
            className="h-12 rounded-3xl text-base font-semibold"
          >
            <Pause className="size-4" />
            中断する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
