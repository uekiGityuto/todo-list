import {
  SquareCheckBig,
  House,
  ListTodo,
  Calendar,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { key: "home", label: "ホーム", icon: House },
  { key: "tasks", label: "タスク", icon: ListTodo },
  { key: "calendar", label: "作業記録", icon: Calendar },
  { key: "settings", label: "設定", icon: Settings },
];

interface SidebarProps {
  activeItem: string;
  onItemChange?: (key: string) => void;
  className?: string;
}

export function Sidebar({ activeItem, onItemChange, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-55 shrink-0 flex-col gap-2 bg-card p-4 pt-6 md:flex",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-0 pb-4">
        <SquareCheckBig className="size-5.5 text-primary" />
        <span className="text-lg font-bold text-foreground">todo-list</span>
      </div>
      {navItems.map((item) => {
        const isActive = activeItem === item.key;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onItemChange?.(item.key)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 ease-out",
              isActive
                ? "bg-primary-soft font-semibold text-primary"
                : "font-medium text-muted-foreground hover:bg-card",
            )}
          >
            <Icon className="size-4.5" />
            {item.label}
          </button>
        );
      })}
    </aside>
  );
}
