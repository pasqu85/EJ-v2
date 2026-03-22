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
  IconChevronLeft,
} from "@tabler/icons-react";

const ONEUI_SPRING = { type: "spring", stiffness: 900, damping: 70, mass: 0.7 } as const;

export type Tab = "home" | "applications" | "search" | "profile";

// ✅ DEFINIZIONE DI ALLTABS (Spostata qui per essere accessibile)
const allTabs: {
  id: Tab;
  Icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
}[] = [
  { id: "home", Icon: IconHome },
  { id: "applications", Icon: IconChecklist },
  { id: "search", Icon: IconSearch },
  { id: "profile", Icon: IconUserCircle },
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
  const isHome = activeTab === "home";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // RECUPERA L'AVATAR
  useEffect(() => {
    async function getAvatar() {
      const { data: { user } } = await supabase.auth.getUser();
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

    // Ascolta i cambiamenti nel profilo per aggiornare la foto live
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
        (payload) => {
          if (payload.new.avatar_url) {
            setAvatarUrl(payload.new.avatar_url);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]">
      <div className="flex items-center gap-3">
        {/* PILL */}
        <motion.div
          layout
          transition={ONEUI_SPRING}
          className={clsx(
            "flex items-center !rounded-full overflow-hidden",
            "bg-white/55 backdrop-blur-2xl border border-white/30",
            "shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
            "will-change-transform"
          )}
        >
          <motion.div
            layout
            transition={ONEUI_SPRING}
            className={clsx("flex items-center", isHome ? "px-6 py-3 gap-6" : "px-3 py-2 gap-3")}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {allTabs.map(({ id, Icon }) => {
                if (!isHome && id === "home") return null;

                const active = activeTab === id;
                const btnSize = isHome ? "w-12 h-12" : "w-10 h-10";

                return (
                  <motion.button
                    key={id}
                    layout="position"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.09 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (id === "search") onSearch();
                      else onChange(id as Exclude<Tab, "search">);
                    }}
                    className={clsx(
                      btnSize,
                      "!rounded-full flex items-center justify-center transition overflow-hidden relative",
                      active && id !== "profile" 
                        ? "bg-emerald-500 text-white bg-linear-to-r from-emerald-700 to-emerald-400" 
                        : "text-gray-500 hover:bg-white/40 "
                    )}
                    aria-label={id}
                  >
                    {/* LOGICA AVATAR VS ICONA */}
                    {id === "profile" && avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profilo" 
                        className={clsx(
                          "w-full h-full object-cover rounded-full",
                          active ? "border-2 border-emerald-500 scale-110" : "opacity-80"
                        )} 
                      />
                    ) : (
                      <Icon size={isHome ? 24 : 22} stroke={active ? 2.2 : 1.9} />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* BACK bubble a destra SOLO fuori home */}
        <AnimatePresence initial={false}>
          {!isHome && (
            <motion.button
              key="back-bubble"
              initial={{ opacity: 0, x: -6, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -6, scale: 0.92 }}
              transition={ONEUI_SPRING}
              whileTap={{ scale: 0.92 }}
              onClick={onBackHome}
              className="w-12 h-12 !rounded-full bg-white/55 backdrop-blur-2xl border border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center"
              aria-label="Indietro"
            >
              <IconChevronLeft size={22} stroke={2.2} className="text-gray-700" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}