import { NextResponse } from "next/server";
import { signOutServerSession } from "@/shared/lib/auth/server";

export async function GET(request: Request) {
  const signOutResponse = await signOutServerSession(request).catch(
    () => undefined,
  );

  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 307,
  });

  for (const setCookie of signOutResponse?.headers.getSetCookie() ?? []) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}
