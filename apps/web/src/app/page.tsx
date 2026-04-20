import {
  getCategories,
  getTasks,
  getWorkRecords,
} from "@/shared/lib/api/server";
import { HomePage } from "@/views/home";

export default async function Page() {
  const [tasks, categories, workRecords] = await Promise.all([
    getTasks(),
    getCategories(),
    getWorkRecords(),
  ]);

  return (
    <HomePage
      initialTasks={tasks}
      initialCategories={categories}
      initialWorkRecords={workRecords}
    />
  );
}
