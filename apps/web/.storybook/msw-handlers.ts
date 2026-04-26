import { HttpResponse, http } from "msw";
import type { Category, Task } from "@/shared/types/task";
import type { TimerSession } from "@/shared/types/timer";
import type { WorkRecord } from "@/shared/types/work-record";
import { STORYBOOK_API_BASE_URL } from "./constants";

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
    http.get(`${STORYBOOK_API_BASE_URL}/categories`, () => {
      return HttpResponse.json(categories);
    }),
    http.get(`${STORYBOOK_API_BASE_URL}/tasks`, () => {
      return HttpResponse.json(tasks);
    }),
    http.get(`${STORYBOOK_API_BASE_URL}/timer-sessions`, () => {
      return HttpResponse.json(timerSession);
    }),
    http.get(`${STORYBOOK_API_BASE_URL}/work-records`, () => {
      return HttpResponse.json(workRecords);
    }),
  ];
}
