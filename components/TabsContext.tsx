"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Tab = "home" | "applications" | "profile";

type Ctx = {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
};

const TabsContext = createContext<Ctx | null>(null);

function readTabFromUrl(): Tab | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  const t = sp.get("tab");
  if (t === "home" || t === "applications" || t === "profile") return t;
  return null;
}

function writeTabToUrl(tab: Tab) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.pushState({ tab }, "", url.toString());
}

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, _setActiveTab] = useState<Tab>(() => readTabFromUrl() ?? "home");

  const setActiveTab = (t: Tab) => {
    _setActiveTab(t);
    // ✅ aggiorna URL (così back/forward funzionano)
    writeTabToUrl(t);
  };

  // ✅ quando premi back/forward, aggiorna il tab
  useEffect(() => {
    const onPop = () => {
      const t = readTabFromUrl() ?? "home";
      _setActiveTab(t);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used inside TabsProvider");
  return ctx;
}