"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import clsx from "clsx";
import {
  IconHome,
  IconChecklist,
  IconSearch,
  IconUserCircle,
} from "@tabler/icons-react";

// Stile Liquid Glass iOS / Netflix Fluid
const LIQUID_GLASS_NETFLIX = {
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.65)",
  boxShadow:
    "0 24px 48px -12px rgba(15, 23, 42, 0.18), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95), inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.05)",
  backdropFilter: "blur(32px) saturate(210%)",
  WebkitBackdropFilter: "blur(32px) saturate(210%)",
} as const;

export type Tab = "home" | "applications" | "search" | "profile";

const allTabs: {
  id: Tab;
  label: string;
  Icon: React.ComponentType<{
    size?: number;
    stroke?: number;
    className?: string;
  }>;
}[] = [
  { id: "home", label: "Home", Icon: IconHome },
  { id: "applications", label: "Candidature", Icon: IconChecklist },
  { id: "search", label: "Cerca", Icon: IconSearch },
  { id: "profile", label: "Profilo", Icon: IconUserCircle },
];

export default function BottomBar({
  activeTab,
  onChange,
  onSearch,
  onBackHome,
}: {
  activeTab: Tab;
  onChange: (tab: Exclude<Tab, "search">) => void;
  onSearch: () => void;
  onBackHome: () => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getAvatar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    }

    getAvatar();
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      {/* PILLOLA UNICA LIQUID GLASS CON TUTTI I BOTTONI */}
      <motion.div
        layout
        style={LIQUID_GLASS_NETFLIX}
        className="relative overflow-hidden !rounded-full p-2"
      >
        {/* Riflesso di luce superiore "Liquid Specular" */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-[45%] rounded-full bg-gradient-to-b from-white/70 to-transparent"
        />

        <div className="relative z-10 flex items-center gap-2">
          {allTabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;

            return (
              <motion.button
                key={id}
                onClick={() => {
                  if (id === "search") {
                    onSearch();
                  } else if (id === "home") {
                    onBackHome();
                  } else {
                    onChange(id as Exclude<Tab, "search">);
                  }
                }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={clsx(
                  "relative flex h-12 items-center justify-center gap-2 px-4 !rounded-full transition-colors duration-300 select-none",
                  active
                    ? "text-emerald-950 font-black"
                    : "text-slate-600 hover:text-slate-900"
                )}
                aria-label={label}
              >
                {/* PILLOLA ATTIVA LIQUID GLASS */}
                {active && (
                  <motion.div
                    layoutId="liquidActivePillWorkerFixed"
                    className="absolute inset-0 !rounded-full bg-gradient-to-b from-white to-emerald-50/80 shadow-[0_8px_20px_rgba(16,185,129,0.15),_inset_0_1px_1px_rgba(255,255,255,1)] border border-white/90"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}

                {/* AVATAR O ICONA */}
                {id === "profile" && avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profilo"
                    className={clsx(
                      "relative z-10 w-6 h-6 object-cover rounded-full",
                      active ? "ring-2 ring-emerald-500" : "opacity-80"
                    )}
                  />
                ) : (
                  <Icon
                    size={22}
                    stroke={active ? 2.8 : 2}
                    className="relative z-10"
                  />
                )}

                {/* TESTO DINAMICO ESPANDIBILE (STILE NETFLIX) */}
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                      className="relative z-10 overflow-hidden whitespace-nowrap text-sm tracking-tight"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}