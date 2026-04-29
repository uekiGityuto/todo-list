import { Bell, Check, Pause, RotateCw } from "lucide-react";

import { LoadingButton } from "@/shared/ui/loading-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";

type TimerLoadingAction = "complete" | "continue" | "interrupt";

interface TimerEndDialogProps {
  open: boolean;
  taskName: string;
  onComplete: () => void;
  onContinue: () => void;
  onInterrupt: () => void;
  loadingAction?: TimerLoadingAction | null;
}

export function TimerEndDialog({
  open,
  taskName,
  onComplete,
  onContinue,
  onInterrupt,
  loadingAction = null,
}: TimerEndDialogProps) {
  const isLoading = loadingAction !== null;
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
          <LoadingButton
            onClick={onComplete}
            className="h-12 rounded-3xl text-base font-semibold"
            loading={loadingAction === "complete"}
            disabled={isLoading}
          >
            <Check className="size-4" />
            完了
          </LoadingButton>
          <LoadingButton
            variant="secondary"
            onClick={onContinue}
            className="h-12 rounded-3xl text-base font-semibold"
            loading={loadingAction === "continue"}
            disabled={isLoading}
          >
            <RotateCw className="size-4" />
            継続する
          </LoadingButton>
          <LoadingButton
            variant="outline"
            onClick={onInterrupt}
            className="h-12 rounded-3xl text-base font-semibold"
            loading={loadingAction === "interrupt"}
            disabled={isLoading}
          >
            <Pause className="size-4" />
            中断する
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
