"use client";

import { useCallback } from "react";
import type { UseFormSetError } from "react-hook-form";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";
import type { AuthFormValues } from "./auth-form-schema";

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
          message: error.message,
        });
        return;
      }

      onSuccess();
    },
    [isLogin, onSuccess, setError],
  );
}
