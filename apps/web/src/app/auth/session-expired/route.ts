import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut().catch(() => undefined);

  return NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });
}
