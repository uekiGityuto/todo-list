import { getCategories, getTasks } from "@/shared/lib/api/server";
import { SettingsPage } from "@/views/settings";

export default async function Page() {
  const [tasks, categories] = await Promise.all([getTasks(), getCategories()]);

  return <SettingsPage initialTasks={tasks} initialCategories={categories} />;
}
