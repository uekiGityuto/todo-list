export function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeCategoryName() {
  return `e2e-category-${uniqueSuffix()}`;
}

export function makeTaskName() {
  return `e2e-task-${uniqueSuffix()}`;
}
