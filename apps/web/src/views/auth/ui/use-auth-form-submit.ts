"use client";

import { useCallback } from "react";
import type { UseFormSetError } from "react-hook-form";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";
import type { AuthFormValues } from "./auth-form-schema";

/** Supabase Auth のエラーコードを日本語メッセージに変換する */
function toJapaneseMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case "invalid_credentials":
      return "メールアドレスまたはパスワードが正しくありません";
    case undefined:
    default:
      return fallback;
  }
}

interface UseAuthFormSubmitParams {
  isLogin: boolean;
  onSuccess: () => void;
  setError: UseFormSetError<AuthFormValues>;
}

export function useAuthFormSubmit({
  isLogin,
  onSuccess,
  setError,
}: UseAuthFormSubmitParams) {
  return useCallback(
    async (values: AuthFormValues) => {
      const supabase = createSupabaseBrowserClient();

      const { error } = isLogin
        ? await supabase.auth.signInWithPassword(values)
        : await supabase.auth.signUp(values);

      if (error) {
        setError("root.serverError", {
          type: "server",
          message: toJapaneseMessage(error.code, error.message),
        });
        return;
      }

      onSuccess();
    },
    [isLogin, onSuccess, setError],
  );
}
