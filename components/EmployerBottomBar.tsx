"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { IconBriefcase, IconBuilding, IconPlus } from "@tabler/icons-react";
import { Tooltip } from "@mantine/core";

export default function EmployerBottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleAction = (id: string, href: string) => {
    if (id === "create") {
      if (pathname !== "/employer") {
        router.push("/employer");
      } else {
        window.dispatchEvent(new Event("open-job-stepper"));
      }
    } else {
      router.push(href);
    }
  };

  const tabs = [
    { id: "create", href: "/employer", Icon: IconPlus, label: "Pubblica" },
    { id: "jobs", href: "/employer/jobs", Icon: IconBriefcase, label: "I miei lavori" },
    { id: "profile", href: "/employer/profile", Icon: IconBuilding, label: "Profilo" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* CONTENITORE ESTERNO (Definisce il bordo luminoso) */}
      <motion.div
        layout
        className="relative !rounded-full p-[1.5px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
      >
        {/* ✨ FASCIO LUMINOSO BLU (Effetto Gemini Employer) ✨ */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[300%]"
          style={{
            // Palette colori: Blu cobalto -> Ciano -> Blu elettrico
            background: "conic-gradient(from 0deg, transparent 0deg, #2563eb 30deg, #22d3ee 60deg, #3b82f6 90deg, transparent 120deg)",
            filter: "blur(5px)",
          }}
        />

        {/* PILLOLA INTERNA (La barra vera e propria) */}
        <div
          className="flex items-center gap-4 px-4 py-3 bg-white/90 backdrop-blur-2xl rounded-full relative z-10"
        >
          {tabs.map(({ id, href, Icon, label }) => {
            const isCreate = id === "create";
            const active = pathname === href;

            return (
              <Tooltip
                key={id}
                label={label}
                opened={isCreate && pathname === "/employer" ? true : undefined}
                color="blue"
                withArrow
                radius="md"
                offset={15}
                position="top"
                zIndex={100}
                disabled={!isCreate || pathname !== "/employer"}
              >
                <motion.button
                  onClick={() => handleAction(id, href)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className={clsx(
                    "w-12 h-12 !rounded-full flex items-center justify-center transition-all duration-300 relative",
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-400 hover:text-gray-600 hover:bg-slate-50"
                  )}
                  aria-label={label}
                >
                  {/* Effetto bagliore interno extra per il tasto attivo */}
                  {active && (
                    <motion.div 
                      layoutId="activeGlowEmployer"
                      className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-30 -z-10"
                    />
                  )}
                  <Icon size={24} stroke={active ? 2.5 : 2} />
                </motion.button>
              </Tooltip>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}