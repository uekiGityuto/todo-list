/** localStorage に保存する形 */
export type TimerSession = {
  taskId: string;
  taskName: string;
  categoryName: string;
  estimatedMinutes: number;
  startedAt: string;
};
