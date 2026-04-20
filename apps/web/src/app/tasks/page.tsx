import { getCategories, getTasks } from "@/shared/lib/api/server";
import { TasksPage } from "@/views/tasks";

export default async function Page() {
  const [tasks, categories] = await Promise.all([getTasks(), getCategories()]);

  return <TasksPage initialTasks={tasks} initialCategories={categories} />;
}
