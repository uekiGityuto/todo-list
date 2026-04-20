import {
  getCategories,
  getTasks,
  getWorkRecords,
} from "@/shared/lib/api/server";
import { CalendarPage } from "@/views/calendar";

export default async function Page() {
  const [tasks, categories, workRecords] = await Promise.all([
    getTasks(),
    getCategories(),
    getWorkRecords(),
  ]);

  return (
    <CalendarPage
      initialTasks={tasks}
      initialCategories={categories}
      initialWorkRecords={workRecords}
    />
  );
}
