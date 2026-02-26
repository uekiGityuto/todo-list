"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

import type { TimerSession } from "@/types/timer";

const TIMER_SESSION_KEY = "timer-session";
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
  start: () => void;
  complete: () => TimerResult;
  interrupt: () => TimerResult;
  restart: () => void;
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

export function calcDurationMinutes(startedAt: string): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
}

export function useTimer(input: UseTimerInput): UseTimerReturn {
  const { value: session, setValue: setSession } =
    useLocalStorage<TimerSession | null>(TIMER_SESSION_KEY, null);

  const initialRemaining = session
    ? calcRemainingSeconds(session.startedAt, session.estimatedMinutes)
    : input.estimatedMinutes * 60;
  const initialFinished = session !== null && initialRemaining === 0;

  const [remainingSeconds, setRemainingSeconds] = useState(initialRemaining);
  const [isRunning, setIsRunning] = useState(
    () => session !== null && !initialFinished,
  );
  const [isFinished, setIsFinished] = useState(initialFinished);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

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
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    intervalRef.current = setInterval(tick, INTERVAL_MS);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isFinished, session]);

  const initSession = useCallback(() => {
    const now = new Date().toISOString();
    const newSession: TimerSession = {
      taskId: input.taskId,
      taskName: input.taskName,
      categoryName: input.categoryName,
      estimatedMinutes: input.estimatedMinutes,
      startedAt: now,
    };
    setSession(newSession);
    setRemainingSeconds(input.estimatedMinutes * 60);
    setIsFinished(false);
    setIsRunning(true);
  }, [input, setSession]);

  const start = useCallback(() => initSession(), [initSession]);

  const stop = useCallback((): TimerResult => {
    clearTimer();
    const currentSession = session!;
    const result: TimerResult = {
      taskId: currentSession.taskId,
      durationMinutes: calcDurationMinutes(currentSession.startedAt),
      startedAt: currentSession.startedAt,
    };
    setSession(null);
    setIsRunning(false);
    setIsFinished(false);
    return result;
  }, [session, setSession, clearTimer]);

  const complete = useCallback((): TimerResult => stop(), [stop]);

  const interrupt = useCallback((): TimerResult => stop(), [stop]);

  const restart = useCallback(() => initSession(), [initSession]);

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

export { TIMER_SESSION_KEY };
