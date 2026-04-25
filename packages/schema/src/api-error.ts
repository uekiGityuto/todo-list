export const API_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  NOT_FOUND: "NOT_FOUND",
  ACTIVE_SESSION_EXISTS: "ACTIVE_SESSION_EXISTS",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_JSON: "INVALID_JSON",
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  code: ApiErrorCode;
  message: string;
  errors?: ApiFieldError[];
  requestId?: string;
};
