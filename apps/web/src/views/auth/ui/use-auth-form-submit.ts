"use client";

import { useCallback } from "react";
import type { UseFormSetError } from "react-hook-form";
import { authClient } from "@/shared/lib/auth/client";
import type { AuthFormValues } from "./auth-form-schema";

function toJapaneseMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "メールアドレスまたはパスワードが正しくありません";
    case "USER_ALREADY_EXISTS":
      return "このメールアドレスは既に使用されています";
    case "ACCOUNT_LOCKED":
      return "ログイン失敗が続いたためアカウントを一時的にロックしました。しばらくしてから再度お試しください";
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
      const result = isLogin
        ? await authClient.signIn.email(values)
        : await authClient.signUp.email({
            ...values,
            name: values.email.split("@")[0] || "user",
          });

      if (result.error) {
        setError("root.serverError", {
          type: "server",
          message: toJapaneseMessage(
            result.error.code,
            result.error.message ?? "認証に失敗しました",
          ),
        });
        return;
      }

      onSuccess();
    },
    [isLogin, onSuccess, setError],
  );
}
