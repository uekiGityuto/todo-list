import {
  getCategories,
  getCurrentTimerSession,
  getTasks,
} from "@/shared/lib/api/server";
import { TimerPage } from "@/views/timer";

export default async function Page() {
  const [tasks, categories, timerSession] = await Promise.all([
    getTasks(),
    getCategories(),
    getCurrentTimerSession(),
  ]);

  return (
    <TimerPage
      initialTasks={tasks}
      initialCategories={categories}
      initialTimerSession={timerSession}
    />
  );
}
