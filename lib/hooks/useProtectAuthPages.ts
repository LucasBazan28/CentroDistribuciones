import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../supabaseBrowser";
import { logoutUser } from "../auth";

export function useProtectAuthPages() {
  const router = useRouter();

  useEffect(() => {
    const checkAndLogout = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await logoutUser();
        router.push("/");
      }
    };

    checkAndLogout();
  }, [router]);
}
