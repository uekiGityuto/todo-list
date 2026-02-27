import {
  House,
  ListTodo,
  Calendar,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

const tabs: TabItem[] = [
  { key: "home", label: "ホーム", icon: House },
  { key: "tasks", label: "タスク", icon: ListTodo },
  { key: "calendar", label: "作業記録", icon: Calendar },
  { key: "settings", label: "設定", icon: Settings },
];

interface TabBarProps {
  activeTab: string;
  onTabChange?: (key: string) => void;
  className?: string;
}

export function TabBar({ activeTab, onTabChange, className }: TabBarProps) {
  return (
    <nav
      className={cn(
        "flex items-center bg-background px-0 pb-2 pt-1 md:hidden",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange?.(tab.key)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 px-4 py-1.5 transition-all duration-200 ease-out",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            <span
              className={cn(
                "text-xs",
                isActive ? "font-semibold" : "font-medium",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
