"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@/shared/ui/loading-button";
import { Input } from "@/shared/ui/shadcn/input";
import { Label } from "@/shared/ui/shadcn/label";
import { type AuthFormValues, authFormSchema } from "./auth-form-schema";
import { useAuthFormSubmit } from "./use-auth-form-submit";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLogin = mode === "login";
  const loading = isSubmitting;
  const submitAuthForm = useAuthFormSubmit({
    isLogin,
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
    setError,
  });

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    await submitAuthForm(values);
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      data-testid={isLogin ? "login-page" : "signup-page"}
    >
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8">
        <h1 className="text-center text-2xl font-bold text-card-foreground">
          {isLogin ? "ログイン" : "アカウント作成"}
        </h1>

        <form
          onSubmit={onSubmit}
          className="space-y-4"
          noValidate
          data-testid={isLogin ? "login-form" : "signup-form"}
        >
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              data-testid="auth-email-input"
              type="email"
              placeholder="mail@example.com"
              aria-invalid={!!errors.email}
              disabled={loading}
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              data-testid="auth-password-input"
              type="password"
              placeholder="6文字以上"
              aria-invalid={!!errors.password}
              disabled={loading}
              {...register("password")}
            />
            {errors.password?.message && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root?.serverError?.message && (
            <p
              className="text-sm text-destructive"
              data-testid="auth-server-error"
            >
              {errors.root.serverError.message}
            </p>
          )}

          <LoadingButton
            type="submit"
            className="w-full"
            loading={loading}
            data-testid="auth-submit-button"
          >
            {isLogin ? "ログイン" : "アカウント作成"}
          </LoadingButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              アカウントをお持ちでない方は
              <Link href="/signup" className="text-primary hover:underline">
                こちら
              </Link>
            </>
          ) : (
            <>
              既にアカウントをお持ちの方は
              <Link href="/login" className="text-primary hover:underline">
                こちら
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
