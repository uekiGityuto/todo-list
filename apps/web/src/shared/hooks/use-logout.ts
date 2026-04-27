import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { authClient } from "@/shared/lib/auth/client";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await authClient.signOut();
    queryClient.clear();
    router.push("/login");
    router.refresh();
  }, [router, queryClient]);
}
