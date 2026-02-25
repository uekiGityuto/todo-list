"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

type UseLocalStorageReturn<T> = {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  const subscribersRef = useRef(new Set<() => void>());
  const cachedRef = useRef<{ raw: string | null; parsed: T } | null>(null);

  const subscribe = useCallback((callback: () => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const getSnapshot = useCallback((): T => {
    const raw =
      typeof window === "undefined" ? null : window.localStorage.getItem(key);
    if (cachedRef.current && cachedRef.current.raw === raw) {
      return cachedRef.current.parsed;
    }
    const parsed = raw === null ? initialValue : (JSON.parse(raw) as T);
    cachedRef.current = { raw, parsed };
    return parsed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const getServerSnapshot = useCallback((): T => {
    return initialValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const currentRaw = window.localStorage.getItem(key);
      const current: T =
        currentRaw === null ? initialValue : (JSON.parse(currentRaw) as T);
      const resolved =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(current)
          : newValue;
      const newRaw = JSON.stringify(resolved);
      window.localStorage.setItem(key, newRaw);
      cachedRef.current = { raw: newRaw, parsed: resolved };
      subscribersRef.current.forEach((cb) => cb());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return { value, setValue };
}
