"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import EmployerBottomBar from "@/components/EmployerBottomBar"


export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!alive) return;

      if (data?.role !== "employer") {
        router.replace("/");
        return;
      }

      setAllowed(true);
    }

    check();
    return () => {
      alive = false;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Caricamento…
      </div>
    
    );
  }

  return (
    <>
      {children}
      <EmployerBottomBar />
    </>
  );
}