import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "../auth-form";

const push = vi.fn();
const refresh = vi.fn();
const { signInEmail, signUpEmail } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/shared/lib/auth/client", () => ({
  authClient: {
    signIn: {
      email: signInEmail,
    },
    signUp: {
      email: signUpEmail,
    },
  },
}));

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空のメールアドレスでは必須エラーを表示する", async () => {
    const user = userEvent.setup();

    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("パスワード"), "12345678");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスを入力してください"),
    ).toBeVisible();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("不正なメールアドレスでは送信しない", async () => {
    const user = userEvent.setup();

    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("メールアドレス"), "invalid");
    await user.type(screen.getByLabelText("パスワード"), "12345678");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスを正しく入力してください"),
    ).toBeVisible();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("ログイン成功時にトップへ遷移する", async () => {
    const user = userEvent.setup();
    signInEmail.mockResolvedValue({ error: null });

    render(<AuthForm mode="login" />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "mail@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "12345678");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() =>
      expect(signInEmail).toHaveBeenCalledWith({
        email: "mail@example.com",
        password: "12345678",
      }),
    );
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });

  it("サインアップエラーを表示する", async () => {
    const user = userEvent.setup();
    signUpEmail.mockResolvedValue({
      error: { message: "Email rate limit exceeded" },
    });

    render(<AuthForm mode="signup" />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "mail@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "12345678");
    await user.click(screen.getByRole("button", { name: "アカウント作成" }));

    expect(await screen.findByText("Email rate limit exceeded")).toBeVisible();
  });

  it("invalid_credentials エラーを日本語で表示する", async () => {
    const user = userEvent.setup();
    signInEmail.mockResolvedValue({
      error: {
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
      },
    });

    render(<AuthForm mode="login" />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "mail@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText(
        "メールアドレスまたはパスワードが正しくありません",
      ),
    ).toBeVisible();
  });

  it("サインアップ時はメールアドレスから表示名を作る", async () => {
    const user = userEvent.setup();
    signUpEmail.mockResolvedValue({ error: null });

    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("メールアドレス"), "new@example.com");
    await user.type(screen.getByLabelText("パスワード"), "12345678");
    await user.click(screen.getByRole("button", { name: "アカウント作成" }));

    await waitFor(() =>
      expect(signUpEmail).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "12345678",
        name: "new",
      }),
    );
  });
});
