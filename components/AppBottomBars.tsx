"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

// ⬇️ importa i tuoi due componenti (percorsi da adattare se diversi)
import BottomBar from "@/components/BottomBar";
import EmployerBottomBar from "@/components/EmployerBottomBar";

type UserRole = "worker" | "employer" | null;
type Tab = "home" | "applications" | "search" | "profile";

export default function AppBottomBars({
  activeTab,
  onChangeTab,
  onSearch,
  onBackHome,
}: {
  activeTab: Tab;
  onChangeTab: (tab: Exclude<Tab, "search">) => void;
  onSearch: () => void;
  onBackHome: () => void;
}) {
  const pathname = usePathname();

  const [role, setRole] = useState<UserRole>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data.session;
      setHasSession(!!session);

      if (!session) {
        setRole(null);
        setSessionReady(true);
        return;
      }

      const user = session.user;

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      setRole((prof?.role as UserRole) ?? null);
      setSessionReady(true);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, newSession) => {
      if (!mounted) return;

      setHasSession(!!newSession);

      if (!newSession) {
        setRole(null);
        return;
      }

      const user = newSession.user;
      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!mounted) return;
      setRole((prof?.role as UserRole) ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // ✅ finché non sappiamo session/ruolo, non mostrare niente (evita flash)
  if (!sessionReady) return null;

  // ✅ NON LOGGATO => niente bottom bar
  if (!hasSession) return null;

  // ✅ Se sei in /employer* e sei employer => EmployerBottomBar
  if (role === "employer" && pathname.startsWith("/employer")) {
    return <EmployerBottomBar />;
  }

  // ✅ Worker loggato => BottomBar worker
  if (role === "worker") {
    return (
      <BottomBar
        activeTab={activeTab}
        onChange={onChangeTab}
        onSearch={onSearch}
        onBackHome={onBackHome}
      />
    );
  }

  // fallback
  return null;
}