"use client";

import { CircleAlert, Check, Pause } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { TIMER_SESSION_KEY } from "@/hooks/use-timer";

import type { TimerSession } from "@/types/timer";

export function RecoveryDialog({
  onComplete,
  onInterrupt,
}: {
  onComplete: (session: TimerSession) => void;
  onInterrupt: (session: TimerSession) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { value: session } = useLocalStorage<TimerSession | null>(
    TIMER_SESSION_KEY,
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = session !== null && pathname !== "/timer" && !dismissed;

  if (!shouldShow || !session) return null;

  const handleComplete = () => {
    setDismissed(true);
    onComplete(session);
    router.push("/");
  };

  const handleInterrupt = () => {
    setDismissed(true);
    onInterrupt(session);
    router.push("/");
  };

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="max-w-80 gap-5 p-7">
        <DialogHeader className="items-center gap-5">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
            <CircleAlert className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            前回の作業が未完了です
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {session.taskName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5">
          <Button
            onClick={handleComplete}
            className="h-12 rounded-3xl text-base font-semibold"
          >
            <Check className="size-4" />
            完了にする
          </Button>
          <Button
            variant="outline"
            onClick={handleInterrupt}
            className="h-12 rounded-3xl text-base font-semibold"
          >
            <Pause className="size-4" />
            中断にする
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
