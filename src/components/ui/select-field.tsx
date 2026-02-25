import { cn } from "@/lib/utils";

const triggerClassName =
  "flex h-12 w-full items-center justify-between rounded-4xl border border-input bg-transparent px-4 text-sm text-left transition-all duration-200 ease-out";

interface SelectFieldProps {
  value: string | number | null;
  onChange: (value: string) => void;
  options: readonly {
    readonly label: string;
    readonly value: string | number | null;
  }[];
  placeholder?: string;
  className?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder = "選択してください",
  className,
}: SelectFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(triggerClassName, "appearance-none pr-10")}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.label} value={opt.value ?? ""}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        &#x25BE;
      </span>
    </div>
  );
}

interface SelectFieldTriggerProps {
  onClick: () => void;
  hasValue: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SelectFieldTrigger({
  onClick,
  hasValue,
  children,
  className,
}: SelectFieldTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(triggerClassName, className)}
    >
      <span className={hasValue ? "text-foreground" : "text-muted-foreground"}>
        {children}
      </span>
      <span className="text-muted-foreground">&#x25BE;</span>
    </button>
  );
}
