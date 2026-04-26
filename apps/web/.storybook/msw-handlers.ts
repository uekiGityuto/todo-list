import { HttpResponse, http } from "msw";
import type { Category, Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";

const API_BASE_URL = "http://localhost:3001";

export function createStoryHandlers({
  categories = [],
  tasks = [],
  timerSession = null,
  workRecords = [],
}: {
  categories?: Category[];
  tasks?: Task[];
  timerSession?: TimerSession | null;
  workRecords?: WorkRecord[];
} = {}) {
  return [
    http.get(`${API_BASE_URL}/categories`, () => {
      return HttpResponse.json(categories);
    }),
    http.get(`${API_BASE_URL}/tasks`, () => {
      return HttpResponse.json(tasks);
    }),
    http.get(`${API_BASE_URL}/timer-sessions`, () => {
      return HttpResponse.json(timerSession);
    }),
    http.get(`${API_BASE_URL}/work-records`, () => {
      return HttpResponse.json(workRecords);
    }),
  ];
}
