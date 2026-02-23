"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

type UserRole = "worker" | "employer";
const PENDING_ROLE_KEY = "EXTRAJOB_PENDING_ROLE";

async function ensureProfile(
  userId: string,
  payload: { role: UserRole; name: string; surname: string; phone: string }
) {
  // IMPORTANT: richiede policy RLS che permetta insert/update solo del proprio profilo
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: payload.role,
        name: payload.name,
        surname: payload.surname,
        phone: payload.phone,
      },
      { onConflict: "id" }
    );

  if (error) throw error;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Sto completando l’accesso…");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Se arrivi da email confirmation / oauth, qui spesso la session è già presente
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data.session;
        if (!session) {
          setMsg("Sessione non trovata. Riprova ad accedere.");
          return;
        }

        const user = session.user;

        // ruolo: prima prova pending (da welcome), altrimenti worker
        const pending =
          (typeof window !== "undefined"
            ? (localStorage.getItem(PENDING_ROLE_KEY) as UserRole | null)
            : null) ?? null;

        if (typeof window !== "undefined") localStorage.removeItem(PENDING_ROLE_KEY);

        const role: UserRole = pending ?? "worker";

        // prova a “splittare” il nome da google
        const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
        const parts = fullName.trim().split(" ");
        const name = parts[0] ?? "";
        const surname = parts.slice(1).join(" ") ?? "";

        // completa/crea profilo
        await ensureProfile(user.id, {
          role,
          name,
          surname,
          phone: "",
        });

        if (!alive) return;

        // vai nella zona giusta
        router.replace(role === "employer" ? "/employer" : "/");
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message ?? "Errore nel callback");
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
      {msg}
    </div>
  );
}