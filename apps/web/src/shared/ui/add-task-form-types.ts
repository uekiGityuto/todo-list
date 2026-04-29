export interface TaskFormData {
  name: string;
  categoryId: string;
  scheduledDate: string | null;
  estimatedMinutes: number | null;
}
