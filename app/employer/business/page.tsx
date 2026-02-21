"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

type Business = {
  id: string;
  name: string;
  type: string | null;
  address: string;
  is_default: boolean;
  created_at: string;
};

export default function EmployerBusinessPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [items, setItems] = useState<Business[]>([]);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        setAuthChecked(true);
        router.replace("/");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (prof?.role !== "employer") {
        setAuthChecked(true);
        router.replace("/");
        return;
      }

      setOwnerId(user.id);

      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, type, address, is_default, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) console.error(error);
      setItems((data ?? []) as Business[]);

      setAuthChecked(true);
    }

    init();
    return () => {
      mounted = false;
    };
  }, [router]);

  const createBusiness = async () => {
    if (!ownerId) return;

    if (!name.trim() || !address.trim()) {
      alert("Nome attività e indirizzo sono obbligatori");
      return;
    }

    const { data, error } = await supabase
      .from("businesses")
      .insert({
        owner_id: ownerId,
        name: name.trim(),
        type: type.trim() || null,
        address: address.trim(),
        is_default: items.length === 0, // prima attività = default
      })
      .select("id, name, type, address, is_default, created_at")
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setItems((prev) => [data as Business, ...prev]);
    setName("");
    setType("");
    setAddress("");
  };

  const setDefault = async (id: string) => {
    if (!ownerId) return;

    // 1) reset tutte a false
    const { error: e1 } = await supabase
      .from("businesses")
      .update({ is_default: false })
      .eq("owner_id", ownerId);

    if (e1) {
      console.error(e1);
      alert(e1.message);
      return;
    }

    // 2) set quella scelta a true
    const { error: e2 } = await supabase
      .from("businesses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("owner_id", ownerId);

    if (e2) {
      console.error(e2);
      alert(e2.message);
      return;
    }

    // aggiorna UI
    setItems((prev) =>
      prev.map((b) => ({ ...b, is_default: b.id === id }))
    );
  };

  if (!authChecked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border rounded-2xl px-5 py-4 shadow-sm">
          Caricamento…
        </div>
      </div>
    );
  }

  if (!ownerId) return null;

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-2xl font-bold">Le tue attività</h1>

      {/* CREATE */}
      <div className="bg-white border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Aggiungi attività</div>
        <input className="w-full border rounded-xl p-3" placeholder="Nome attività" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded-xl p-3" placeholder="Tipo (es. Ristorante)" value={type} onChange={(e) => setType(e.target.value)} />
        <input className="w-full border rounded-xl p-3" placeholder="Indirizzo" value={address} onChange={(e) => setAddress(e.target.value)} />
        <button onClick={createBusiness} className="w-full rounded-xl py-3 font-semibold text-white bg-linear-to-r from-blue-500 to-cyan-500">
          Salva attività
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {items.map((b) => (
          <div key={b.id} className="bg-white border rounded-2xl p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold truncate">{b.name}</div>
              <div className="text-sm text-slate-600 truncate">{b.type || "Attività"}</div>
              <div className="text-sm text-slate-500 mt-1 truncate">{b.address}</div>
              {b.is_default && (
                <div className="mt-2 text-xs font-bold inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  Default
                </div>
              )}
            </div>

            <button
              onClick={() => setDefault(b.id)}
              className="shrink-0 px-3 py-2 rounded-xl border font-semibold"
            >
              Imposta default
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}