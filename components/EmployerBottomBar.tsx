"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { IconBriefcase, IconBuilding, IconPlus } from "@tabler/icons-react";
import { Tooltip } from "@mantine/core";

export default function EmployerBottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  // Logica per gestire il click sul tasto "Pubblica" (+)
  const handleAction = (id: string, href: string) => {
    if (id === "create") {
      if (pathname !== "/employer") {
        // 1. Se non siamo in dashboard, ci spostiamo
        router.push("/employer");
      } else {
        // 2. Se siamo già in dashboard, lanciamo l'evento per aprire lo stepper
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
      <motion.div
        layout
        className="flex items-center gap-4 px-4 py-3 bg-white/90 backdrop-blur-2xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50"
      >
        {tabs.map(({ id, href, Icon, label }) => {
          const isCreate = id === "create";
          const active = pathname === href;

          return (
            <Tooltip
              key={id}
              label={label}
              opened={isCreate && pathname === "/employer" ? true : undefined} // Tooltip attivo se siamo in dashboard sul +
              color="blue"
              withArrow
              radius="md"
              offset={15}
              position="top"
              zIndex={100}
              // Mostra il tooltip solo sul tasto + quando siamo nella dashboard
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
                {/* Effetto bagliore per il tasto attivo */}
                {active && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-40 -z-10"
                  />
                )}
                <Icon size={24} stroke={active ? 2.5 : 2} />
              </motion.button>
            </Tooltip>
          );
        })}
      </motion.div>
    </div>
  );
}