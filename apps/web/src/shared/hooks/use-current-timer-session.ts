"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  createTimerSession,
  deleteCurrentTimerSession,
  fetchCurrentTimerSession,
} from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/api/query-keys";
import type { TimerSession } from "@/shared/types/timer";

export function useCurrentTimerSession(initialSession?: TimerSession | null) {
  const queryClient = useQueryClient();
  const { data: session = null } = useQuery({
    queryKey: queryKeys.timerSession,
    queryFn: fetchCurrentTimerSession,
    initialData: initialSession,
  });

  const createSessionMutation = useMutation({
    mutationFn: createTimerSession,
    onSuccess: (createdSession) => {
      queryClient.setQueryData(queryKeys.timerSession, createdSession);
    },
  });
  const deleteSessionMutation = useMutation({
    mutationFn: deleteCurrentTimerSession,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.timerSession, null);
    },
  });

  const createSession = useCallback(
    (input: Parameters<typeof createTimerSession>[0]) => {
      return createSessionMutation.mutateAsync(input);
    },
    [createSessionMutation],
  );

  const clearSession = useCallback(async () => {
    await deleteSessionMutation.mutateAsync();
  }, [deleteSessionMutation]);

  return {
    session,
    createSession,
    clearSession,
  };
}
