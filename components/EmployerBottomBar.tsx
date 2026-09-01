"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { IconBriefcase, IconBuilding, IconPlus } from "@tabler/icons-react";
import { Tooltip } from "@mantine/core";

// Stile Liquid Glass iOS / Ultra-Fluid
const LIQUID_GLASS_NETFLIX = {
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.65)",
  boxShadow:
    "0 24px 48px -12px rgba(15, 23, 42, 0.18), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95), inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.05)",
  backdropFilter: "blur(32px) saturate(210%)",
  WebkitBackdropFilter: "blur(32px) saturate(210%)",
} as const;

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
    {
      id: "jobs",
      href: "/employer/jobs",
      Icon: IconBriefcase,
      label: "I miei lavori",
    },
    {
      id: "profile",
      href: "/employer/profile",
      Icon: IconBuilding,
      label: "Profilo",
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
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
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  className={clsx(
                    "relative flex h-12 items-center justify-center gap-2 px-4 !rounded-full transition-colors duration-300 select-none",
                    active ? "text-blue-950 font-black" : "text-slate-600 hover:text-slate-900"
                  )}
                  aria-label={label}
                >
                  {/* PILOLA ATTIVA LIQUID GLASS (Effetto specchio/vetro pieno) */}
                  {active && (
                    <motion.div
                      layoutId="liquidActivePill"
                      className="absolute inset-0 !rounded-full bg-gradient-to-b from-white to-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.12),_inset_0_1px_1px_rgba(255,255,255,1)] border border-white/80"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}

                  <Icon
                    size={22}
                    stroke={active ? 2.8 : 2}
                    className="relative z-10"
                  />

                  {/* TESTO DINAMICO CON ADATTAMENTO DI LARGHEZZA */}
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="relative z-10 overflow-hidden whitespace-nowrap text-sm tracking-tight"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Tooltip>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}