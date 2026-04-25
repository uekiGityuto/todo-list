import { z } from "zod";

export const authFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください")
    .pipe(z.email({ error: "メールアドレスを正しく入力してください" })),
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください")
    .max(72, "パスワードは72文字以内で入力してください"),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;
