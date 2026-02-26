import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTimer, TIMER_SESSION_KEY } from "@/hooks/use-timer";

const DEFAULT_INPUT = {
  taskId: "task-1",
  taskName: "テストタスク",
  categoryName: "カテゴリ1",
  estimatedMinutes: 25,
};

describe("useTimer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態ではタイマーは停止している", () => {
    const { result } = renderHook(() => useTimer(DEFAULT_INPUT));

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.remainingSeconds).toBe(25 * 60);
  });

  it("start でタイマーが開始され、セッションが localStorage に保存される", () => {
    const { result } = renderHook(() => useTimer(DEFAULT_INPUT));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isFinished).toBe(false);

    const stored = JSON.parse(localStorage.getItem(TIMER_SESSION_KEY)!);
    expect(stored.taskId).toBe("task-1");
    expect(stored.taskName).toBe("テストタスク");
    expect(stored.estimatedMinutes).toBe(25);
  });

  it("complete でセッションが削除され、作業結果が返される", () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    const { result } = renderHook(() => useTimer(DEFAULT_INPUT));

    act(() => {
      result.current.start();
    });

    vi.setSystemTime(new Date("2026-02-26T10:15:00Z"));

    let timerResult: ReturnType<typeof result.current.complete>;
    act(() => {
      timerResult = result.current.complete();
    });

    expect(timerResult!.taskId).toBe("task-1");
    expect(timerResult!.durationMinutes).toBe(15);
    expect(result.current.isRunning).toBe(false);
    expect(localStorage.getItem(TIMER_SESSION_KEY)).toBe("null");
  });

  it("interrupt でセッションが削除され、作業結果が返される", () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    const { result } = renderHook(() => useTimer(DEFAULT_INPUT));

    act(() => {
      result.current.start();
    });

    vi.setSystemTime(new Date("2026-02-26T10:10:00Z"));

    let timerResult: ReturnType<typeof result.current.interrupt>;
    act(() => {
      timerResult = result.current.interrupt();
    });

    expect(timerResult!.taskId).toBe("task-1");
    expect(timerResult!.durationMinutes).toBe(10);
    expect(result.current.isRunning).toBe(false);
  });

  it("restart でタイマーがリセットされて再開する", () => {
    const { result } = renderHook(() => useTimer(DEFAULT_INPUT));

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.restart();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.remainingSeconds).toBe(25 * 60);
  });

  it("カウントダウンが0になると isFinished が true になる", () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    const input = { ...DEFAULT_INPUT, estimatedMinutes: 1 };
    const { result } = renderHook(() => useTimer(input));

    act(() => {
      result.current.start();
    });

    vi.setSystemTime(new Date("2026-02-26T10:01:01Z"));

    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(result.current.isFinished).toBe(true);
    expect(result.current.remainingSeconds).toBe(0);
  });

  it("既存のセッションがある場合、残り時間を復元する", () => {
    const startedAt = new Date("2026-02-26T10:00:00Z").toISOString();
    localStorage.setItem(
      TIMER_SESSION_KEY,
      JSON.stringify({
        taskId: "task-1",
        taskName: "テストタスク",
        categoryName: "カテゴリ1",
        estimatedMinutes: 25,
        startedAt,
      }),
    );

    vi.setSystemTime(new Date("2026-02-26T10:10:00Z"));

    const { result } = renderHook(() => useTimer(DEFAULT_INPUT));

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(15 * 60);
  });
});
