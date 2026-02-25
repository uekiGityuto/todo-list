import { format } from "date-fns";

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = format(date, "EEEE");
  const dayOfWeekMap: Record<string, string> = {
    Monday: "月",
    Tuesday: "火",
    Wednesday: "水",
    Thursday: "木",
    Friday: "金",
    Saturday: "土",
    Sunday: "日",
  };
  return `${month}月${day}日（${dayOfWeekMap[dayOfWeek]}）`;
}
