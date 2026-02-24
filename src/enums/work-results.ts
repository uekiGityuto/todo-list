export const WORK_RESULTS = {
  completed: { label: "完了" },
  interrupted: { label: "中断" },
} as const;

export type WorkResult = keyof typeof WORK_RESULTS;
