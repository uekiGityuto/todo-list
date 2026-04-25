import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "../auth-form";

const push = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/shared/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword,
      signUp,
    },
  }),
}));

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空のメールアドレスでは必須エラーを表示する", async () => {
    const user = userEvent.setup();

    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("パスワード"), "123456");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスを入力してください"),
    ).toBeVisible();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("不正なメールアドレスでは送信しない", async () => {
    const user = userEvent.setup();

    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("メールアドレス"), "invalid");
    await user.type(screen.getByLabelText("パスワード"), "123456");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスを正しく入力してください"),
    ).toBeVisible();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("ログイン成功時にトップへ遷移する", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValue({ error: null });

    render(<AuthForm mode="login" />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "mail@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "123456");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "mail@example.com",
        password: "123456",
      }),
    );
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });

  it("Supabase エラーを表示する", async () => {
    const user = userEvent.setup();
    signUp.mockResolvedValue({
      error: { message: "Email rate limit exceeded" },
    });

    render(<AuthForm mode="signup" />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "mail@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "123456");
    await user.click(screen.getByRole("button", { name: "アカウント作成" }));

    expect(await screen.findByText("Email rate limit exceeded")).toBeVisible();
  });
});
