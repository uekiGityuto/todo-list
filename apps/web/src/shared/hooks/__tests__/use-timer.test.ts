import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimer } from "@/shared/hooks/use-timer";
import * as api from "@/shared/lib/api";
import type { TimerSession } from "@/shared/types/timer";

import { createQueryClientWrapper } from "./query-client-wrapper";

vi.mock("@/shared/lib/api", () => ({
  createTimerSession: vi.fn(),
  deleteCurrentTimerSession: vi.fn(),
  fetchCurrentTimerSession: vi.fn(),
}));

const DEFAULT_INPUT = {
  taskId: "task-1",
  taskName: "テストタスク",
  categoryName: "カテゴリ1",
  estimatedMinutes: 25,
};

const makeSession = (overrides: Partial<TimerSession> = {}): TimerSession => ({
  taskId: "task-1",
  taskName: "テストタスク",
  categoryName: "カテゴリ1",
  estimatedMinutes: 25,
  startedAt: "2026-02-26T10:00:00.000Z",
  ...overrides,
});

function renderUseTimer(initialSession: TimerSession | null = null) {
  vi.mocked(api.fetchCurrentTimerSession).mockResolvedValue(initialSession);

  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useTimer(DEFAULT_INPUT, initialSession), { wrapper });
}

describe("useTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態ではタイマーは停止している", () => {
    const { result } = renderUseTimer();

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.remainingSeconds).toBe(25 * 60);
  });

  it("startでタイマーが開始される", async () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    const createdSession = makeSession();
    vi.mocked(api.createTimerSession).mockResolvedValue(createdSession);

    const { result } = renderUseTimer();

    await act(async () => {
      await result.current.start();
    });

    expect(vi.mocked(api.createTimerSession).mock.calls[0]?.[0]).toEqual(
      DEFAULT_INPUT,
    );
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isFinished).toBe(false);
  });

  it("completeでセッションが削除され、作業結果が返される", async () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    const createdSession = makeSession();
    vi.mocked(api.createTimerSession).mockResolvedValue(createdSession);
    vi.mocked(api.deleteCurrentTimerSession).mockResolvedValue(undefined);

    const { result } = renderUseTimer();

    await act(async () => {
      await result.current.start();
    });

    vi.setSystemTime(new Date("2026-02-26T10:15:00Z"));

    let timerResult:
      | Awaited<ReturnType<typeof result.current.complete>>
      | undefined;
    await act(async () => {
      timerResult = await result.current.complete();
    });

    expect(timerResult?.taskId).toBe("task-1");
    expect(timerResult?.durationMinutes).toBe(15);
    expect(api.deleteCurrentTimerSession).toHaveBeenCalled();
    expect(result.current.isRunning).toBe(false);
  });

  it("interruptでセッションが削除され、作業結果が返される", async () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    const createdSession = makeSession();
    vi.mocked(api.createTimerSession).mockResolvedValue(createdSession);
    vi.mocked(api.deleteCurrentTimerSession).mockResolvedValue(undefined);

    const { result } = renderUseTimer();

    await act(async () => {
      await result.current.start();
    });

    vi.setSystemTime(new Date("2026-02-26T10:10:00Z"));

    let timerResult:
      | Awaited<ReturnType<typeof result.current.interrupt>>
      | undefined;
    await act(async () => {
      timerResult = await result.current.interrupt();
    });

    expect(timerResult?.taskId).toBe("task-1");
    expect(timerResult?.durationMinutes).toBe(10);
    expect(result.current.isRunning).toBe(false);
  });

  it("restartでタイマーがリセットされて再開する", async () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    vi.mocked(api.createTimerSession)
      .mockResolvedValueOnce(makeSession())
      .mockResolvedValueOnce(
        makeSession({
          startedAt: "2026-02-26T10:05:00.000Z",
        }),
      );
    vi.mocked(api.deleteCurrentTimerSession).mockResolvedValue(undefined);

    const { result } = renderUseTimer();

    await act(async () => {
      await result.current.start();
    });

    await act(async () => {
      await result.current.restart();
    });

    expect(api.createTimerSession).toHaveBeenCalledTimes(2);
    expect(api.deleteCurrentTimerSession).toHaveBeenCalledTimes(1);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isFinished).toBe(false);
  });

  it("カウントダウンが0になるとisFinishedがtrueになる", async () => {
    vi.setSystemTime(new Date("2026-02-26T10:00:00Z"));

    const session = makeSession({
      estimatedMinutes: 1,
      startedAt: "2026-02-26T10:00:00.000Z",
    });
    const { result } = renderHook(
      () =>
        useTimer(
          {
            ...DEFAULT_INPUT,
            estimatedMinutes: 1,
          },
          session,
        ),
      { wrapper: createQueryClientWrapper().wrapper },
    );

    vi.setSystemTime(new Date("2026-02-26T10:01:01Z"));

    act(() => {
      vi.advanceTimersByTime(61_000);
    });

    expect(result.current.isFinished).toBe(true);
    expect(result.current.remainingSeconds).toBe(0);
  });

  it("既存のセッションがある場合、残り時間を復元する", () => {
    const session = makeSession({
      startedAt: "2026-02-26T10:00:00.000Z",
    });
    vi.setSystemTime(new Date("2026-02-26T10:10:00Z"));

    const { result } = renderUseTimer(session);

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(15 * 60);
  });

  it("セッションなしでestimatedMinutesが変わるとremainingSecondsが更新される", () => {
    vi.mocked(api.fetchCurrentTimerSession).mockResolvedValue(null);
    const { wrapper } = createQueryClientWrapper();

    let minutes = 25;
    const { result, rerender } = renderHook(
      () => useTimer({ ...DEFAULT_INPUT, estimatedMinutes: minutes }, null),
      { wrapper },
    );

    expect(result.current.remainingSeconds).toBe(25 * 60);

    minutes = 50;
    rerender();

    expect(result.current.remainingSeconds).toBe(50 * 60);
  });
});
