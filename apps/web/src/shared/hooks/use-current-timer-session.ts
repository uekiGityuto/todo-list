"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

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
    mutationFn: (args: {
      input: Parameters<typeof createTimerSession>[0];
      key: string;
    }) => createTimerSession(args.input, args.key),
    onSuccess: (createdSession) => {
      queryClient.setQueryData(queryKeys.timerSession, createdSession);
    },
  });
  const deleteSessionMutation = useMutation({
    mutationFn: (args: { key: string }) => deleteCurrentTimerSession(args.key),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.timerSession, null);
    },
  });

  const createSessionKeyRef = useRef(crypto.randomUUID());
  const clearSessionKeyRef = useRef(crypto.randomUUID());

  const createSession = useCallback(
    async (input: Parameters<typeof createTimerSession>[0]) => {
      const result = await createSessionMutation.mutateAsync({
        input,
        key: createSessionKeyRef.current,
      });
      createSessionKeyRef.current = crypto.randomUUID();
      return result;
    },
    [createSessionMutation],
  );

  const clearSession = useCallback(async () => {
    await deleteSessionMutation.mutateAsync({
      key: clearSessionKeyRef.current,
    });
    clearSessionKeyRef.current = crypto.randomUUID();
  }, [deleteSessionMutation]);

  return {
    session,
    createSession,
    clearSession,
  };
}
