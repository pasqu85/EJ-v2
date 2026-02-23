"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BottomBar, { Tab } from "@/components/BottomBar";
import { supabase } from "@/app/lib/supabaseClient";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmployerArea = pathname.startsWith("/employer");

  const [hasSession, setHasSession] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ✅ session sync (iniziale + realtime)
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session);
      setSessionChecked(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(!!session);
      setSessionChecked(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // mappa url -> tab attivo
  const activeTab: Tab = useMemo(() => {
    if (pathname.startsWith("/applications")) return "applications";
    if (pathname.startsWith("/profile")) return "profile";
    if (searchParams.get("search") === "1") return "search";
    return "home";
  }, [pathname, searchParams]);

  // ✅ mostra bottom bar SOLO se sessione esiste
  const showBottomBar = sessionChecked && hasSession && !isEmployerArea;

  return (
    <div className="min-h-screen">
      {children}

      {showBottomBar && (
        <BottomBar
          activeTab={activeTab}
          onChange={(tab) => {
            if (tab === "home") router.push("/");
            if (tab === "applications") router.push("/applications");
            if (tab === "profile") router.push("/profile");
          }}
          onSearch={() => router.push("/?search=1")}
          onBackHome={() => router.push("/")}
        />
      )}
    </div>
  );
}