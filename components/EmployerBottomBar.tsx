"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { IconBriefcase, IconBuilding, IconPlus } from "@tabler/icons-react";

export default function EmployerBottomBar() {
  const router = useRouter();
  const pathname = usePathname();

const tabs = [
  { id: "create", href: "/employer", Icon: IconPlus, label: "Pubblica" },
  { id: "jobs", href: "/employer/jobs", Icon: IconBriefcase, label: "I miei lavori" },
  { id: "profile", href: "/employer/profile", Icon: IconBuilding, label: "Profilo" },
];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        layout
        className="flex items-center gap-4 px-5 py-3 bg-white/80 backdrop-blur-xl rounded-full shadow-xl border"
      >
        {tabs.map(({ id, href, Icon }) => {
          const active = pathname === href;

          return (
            <motion.button
              key={id}
              onClick={() => router.push(href)}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "w-12 h-12 !rounded-full flex items-center justify-center transition",
                active
                  ? "bg-blue-500 text-white bg-linear-to-r from-blue-500 to-cyan-500"
                  : "text-gray-500 hover:bg-white/50"
              )}
              aria-label={id}
            >
              <Icon size={22} stroke={active ? 2.2 : 1.9} />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
