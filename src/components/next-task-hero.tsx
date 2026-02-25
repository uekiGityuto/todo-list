import { Zap, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NextTaskHeroProps {
  title: string;
  duration?: string;
  category?: string;
  onStart?: () => void;
  className?: string;
}

export function NextTaskHero({
  title,
  duration,
  category,
  onStart,
  className,
}: NextTaskHeroProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[24px] bg-primary px-6 py-7",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Zap className="size-4 text-white" />
        <span className="text-xs font-semibold text-white/85">
          次にやること
        </span>
      </div>
      <h2 className="whitespace-pre-line text-2xl font-bold leading-[1.3] text-white">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {category && (
          <span className="rounded-full bg-white/13 px-2.5 py-1 text-xs font-medium text-white">
            {category}
          </span>
        )}
        {duration && (
          <span className="text-xs font-medium text-white/80">{duration}</span>
        )}
      </div>
      <Button
        variant="ghost"
        onClick={onStart}
        className="w-full justify-center rounded-4xl bg-white/13 py-3 text-sm font-semibold text-white hover:bg-white/20 hover:text-white"
      >
        <Play className="size-4.5" />
        作業を始める
      </Button>
    </div>
  );
}
