"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { IconBriefcase, IconBuilding, IconPlus } from "@tabler/icons-react";
import { Tooltip } from "@mantine/core";

const LIQUID_GLASS = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(219,234,254,0.45) 52%, rgba(191,219,254,0.28) 100%)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.18), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(30,64,175,0.08)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
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
        style={LIQUID_GLASS}
        className="relative overflow-hidden !rounded-full"
      >
        {/* Riflesso superiore del vetro */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-5 top-0 h-1/2 rounded-full bg-linear-to-b from-white/65 to-transparent"
        />

        <div className="relative z-10 flex items-center gap-4 rounded-full px-4 py-3">
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
                    "relative flex h-12 w-12 items-center justify-center !rounded-full transition-all duration-300",
                    active
                      ? "bg-blue-600/90 text-white shadow-[0_8px_20px_rgba(37,99,235,0.32)] ring-1 ring-white/60"
                      : "text-slate-500 hover:bg-white/40 hover:text-slate-800"
                  )}
                  aria-label={label}
                >
                  {active && (
                    <motion.div
                      layoutId="activeGlowEmployer"
                      className="absolute inset-1 !rounded-full bg-white/20"
                    />
                  )}

                  <Icon
                    size={24}
                    stroke={active ? 2.5 : 2}
                    className="relative z-10"
                  />
                </motion.button>
              </Tooltip>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}