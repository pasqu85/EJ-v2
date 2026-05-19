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

  useEffect(() => {
    async function getAvatar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single();
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    }
    getAvatar();
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      <div className="relative flex items-center gap-3">
        
        {/* PILLOLA PRINCIPALE CON BORDO ANIMATO */}
        <motion.div
          layout
          transition={ONEUI_SPRING}
          className="relative !rounded-full p-[1.5px] overflow-hidden" // Lo spessore del bordo
          style={{
            background: "rgba(255, 255, 255, 0.2)", // Bordo base semitrasparente
          }}
        >
          {/* ✨ IL FASCIO LUMINOSO (Corre sul bordo) ✨ */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[300%]"
            style={{
              background: "conic-gradient(from 0deg, transparent 0deg, #1aa934ff 20deg, #abe3a0ff 40deg, #45e442ff 60deg, transparent 90deg)",
              filter: "blur(4px)",
            }}
          />

          {/* CONTENUTO INTERNO (Copre il centro, lasciando vedere solo il bordo) */}
          <motion.div
            layout
            transition={ONEUI_SPRING}
            className={clsx(
              "flex items-center !rounded-full relative z-10",
              "bg-white/70 backdrop-blur-3xl", // Sfondo della barra
              isHome ? "px-6 py-3 gap-6" : "px-3 py-2 gap-3"
            )}
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
                    onClick={() => {
                      if (id === "search") onSearch();
                      else onChange(id as Exclude<Tab, "search">);
                    }}
                    className={clsx(
                      btnSize,
                      "!rounded-full flex items-center justify-center transition relative overflow-hidden",
                      active && id !== "profile" 
                        ? "bg-emerald-500 text-white bg-linear-to-r from-emerald-700 to-emerald-400" 
                        : "text-gray-500 hover:bg-white/40 "
                    )}
                  >
                    {id === "profile" && avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="P" 
                        className={clsx(
                          "w-full h-full object-cover rounded-full",
                          active ? "border-2 border-emerald-500" : "opacity-80"
                        )} 
                      />
                    ) : (
                      <Icon size={isHome ? 24 : 22} stroke={active ? 2.5 : 2.2} />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* BACK BUBBLE CON BORDO ANIMATO MINI */}
        <AnimatePresence initial={false}>
          {!isHome && (
            <motion.div
              key="back-bubble-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative p-[1.5px] !rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0deg, #4285f4 40deg, transparent 80deg)",
                  filter: "blur(2px)",
                }}
              />
              <button
                onClick={onBackHome}
                className="w-12 h-12 !rounded-full bg-white/70 backdrop-blur-3xl flex items-center justify-center relative z-10"
              >
                <IconChevronLeft size={22} stroke={2.5} className="text-gray-700" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}