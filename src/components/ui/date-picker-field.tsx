"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "日付を選択",
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-4xl border border-input bg-transparent px-4 text-sm text-left transition-all duration-200 ease-out",
            className,
          )}
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value ? format(value, "yyyy/MM/dd", { locale: ja }) : placeholder}
          </span>
          <CalendarIcon className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          locale={ja}
        />
      </PopoverContent>
    </Popover>
  );
}
