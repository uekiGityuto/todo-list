"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useCurrentTimerSession } from "@/shared/hooks/use-current-timer-session";
import type { TimerSession } from "@/shared/types/timer";

const INTERVAL_MS = 1000;

type UseTimerInput = {
  taskId: string;
  taskName: string;
  categoryName: string;
  estimatedMinutes: number;
};

type UseTimerReturn = {
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
  start: () => Promise<void>;
  complete: () => Promise<TimerResult>;
  interrupt: () => Promise<TimerResult>;
  restart: () => Promise<void>;
};

export type TimerResult = {
  taskId: string;
  durationMinutes: number;
  startedAt: string;
};

function calcRemainingSeconds(
  startedAt: string,
  estimatedMinutes: number,
): number {
  const endTime = new Date(startedAt).getTime() + estimatedMinutes * 60 * 1000;
  const remaining = Math.ceil((endTime - Date.now()) / 1000);
  return Math.max(0, remaining);
}

function calcInitialState(
  session: TimerSession | null,
  estimatedMinutes: number,
) {
  const remainingSeconds = session
    ? calcRemainingSeconds(session.startedAt, session.estimatedMinutes)
    : estimatedMinutes * 60;
  const isFinished = session !== null && remainingSeconds === 0;

  return {
    remainingSeconds,
    isFinished,
    isRunning: session !== null && !isFinished,
  };
}

export function calcDurationMinutes(startedAt: string): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
}

export function useTimer(
  input: UseTimerInput,
  initialSession?: TimerSession | null,
): UseTimerReturn {
  const { session, createSession, clearSession } =
    useCurrentTimerSession(initialSession);
  const initialState = calcInitialState(session, input.estimatedMinutes);

  const [remainingSeconds, setRemainingSeconds] = useState(
    initialState.remainingSeconds,
  );
  const [isRunning, setIsRunning] = useState(initialState.isRunning);
  const [isFinished, setIsFinished] = useState(initialState.isFinished);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // session 変更時に状態をリセット（レンダリング中の状態更新パターン）
  const [prevSession, setPrevSession] = useState(session);
  if (session !== prevSession) {
    setPrevSession(session);
    const nextState = calcInitialState(session, input.estimatedMinutes);
    setRemainingSeconds(nextState.remainingSeconds);
    setIsRunning(nextState.isRunning);
    setIsFinished(nextState.isFinished);
  }

  // 外部システム同期: タイマーの setInterval 管理
  useEffect(() => {
    if (!isRunning || isFinished || !session) return;

    const tick = () => {
      const remaining = calcRemainingSeconds(
        session.startedAt,
        session.estimatedMinutes,
      );
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        setIsFinished(true);
        clearTimer();
      }
    };

    intervalRef.current = setInterval(tick, INTERVAL_MS);
    return clearTimer;
  }, [clearTimer, isFinished, isRunning, session]);

  const start = useCallback(async () => {
    const createdSession = await createSession({
      taskId: input.taskId,
      taskName: input.taskName,
      categoryName: input.categoryName,
      estimatedMinutes: input.estimatedMinutes,
    });

    setRemainingSeconds(
      calcRemainingSeconds(
        createdSession.startedAt,
        createdSession.estimatedMinutes,
      ),
    );
    setIsFinished(false);
    setIsRunning(true);
  }, [createSession, input]);

  const stop = useCallback(async (): Promise<TimerResult> => {
    if (!session) {
      throw new Error("No active timer session");
    }

    clearTimer();
    const result: TimerResult = {
      taskId: session.taskId,
      durationMinutes: calcDurationMinutes(session.startedAt),
      startedAt: session.startedAt,
    };

    await clearSession();
    setIsRunning(false);
    setIsFinished(false);
    return result;
  }, [clearSession, clearTimer, session]);

  const complete = useCallback(async (): Promise<TimerResult> => {
    return stop();
  }, [stop]);

  const interrupt = useCallback(async (): Promise<TimerResult> => {
    return stop();
  }, [stop]);

  const restart = useCallback(async () => {
    if (session) {
      await clearSession();
    }
    await start();
  }, [clearSession, session, start]);

  return {
    remainingSeconds,
    isRunning,
    isFinished,
    start,
    complete,
    interrupt,
    restart,
  };
}
