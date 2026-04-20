import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";

export function useLogout() {
  const router = useRouter();

  return useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);
}
