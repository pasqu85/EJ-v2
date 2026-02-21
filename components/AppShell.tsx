"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BottomBar, { Tab } from "@/components/BottomBar";
import { STORAGE_KEYS } from "@/app/lib/storageKeys";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmployerArea = pathname.startsWith("/employer");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // login state from localStorage (mock)
    const v = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    setIsLoggedIn(v === "true");
  }, [pathname]);

  useEffect(() => {
  const syncLogin = () => {
    const v = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    setIsLoggedIn(v === "true");
  };

  window.addEventListener("auth-change", syncLogin);
  return () => window.removeEventListener("auth-change", syncLogin);
}, []);


  // mappa url -> tab attivo
  const activeTab: Tab = useMemo(() => {
    if (pathname.startsWith("/applications")) return "applications";
    if (pathname.startsWith("/profile")) return "profile";
    // search è overlay, non una pagina: lo gestiamo via query param opzionale
    if (searchParams.get("search") === "1") return "search";
    
    return "home";
  }, [pathname, searchParams]);

  // Mostra bottom bar solo se loggato
  const showBottomBar = isLoggedIn && !isEmployerArea;


  return (
    <div className="min-h-screen">
      {/* contenuto */}
      {children}

      {/* bottom bar globale */}
      {showBottomBar && (
        <BottomBar
          activeTab={activeTab}
          onChange={(tab) => {
            if (tab === "home") router.push("/");
            if (tab === "applications") router.push("/applications");
            if (tab === "profile") router.push("/profile");
          }}
          onSearch={() => {
            // apre "search mode" sulla home (tu poi lo usi per aprire overlay)
            router.push("/?search=1");
          }}
          onBackHome={() => {
            // qui scegli tu: io la faccio tornare alla home sempre
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
