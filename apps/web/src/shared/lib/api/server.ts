import { cache } from "react";

import {
  fetchCategories,
  fetchCurrentTimerSession,
  fetchTasks,
  fetchWorkRecords,
} from "./index";

export const getTasks = cache(fetchTasks);
export const getCategories = cache(fetchCategories);
export const getWorkRecords = cache(fetchWorkRecords);
export const getCurrentTimerSession = cache(fetchCurrentTimerSession);
