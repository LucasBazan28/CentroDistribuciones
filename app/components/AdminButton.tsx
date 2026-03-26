"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Settings } from "lucide-react";

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if user is admin
        const { data: profile, error } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.rol === "admin");
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="fixed bottom-6 left-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark shadow-lg z-40"
    >
      <Settings size={18} />
      Admin
    </Link>
  );
}
