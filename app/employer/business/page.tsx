"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { IconBuildingSkyscraper, IconPhoto } from "@tabler/icons-react"; // Importate per il placeholder

type Business = {
  id: string;
  name: string;
  type: string | null;
  address: string;
  logo_url: string | null; // Aggiunto logo_url
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
  const [logoUrl, setLogoUrl] = useState(""); // Stato per il logo

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

      // Aggiunto logo_url nella select
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, type, address, logo_url, is_default, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) console.error(error);
      setItems((data ?? []) as Business[]);

      setAuthChecked(true);
    }

    init();
    return () => { mounted = false; };
  }, [router]);

  const createBusiness = async () => {
    if (!ownerId) return;

    if (!name.trim() || !address.trim()) {
      alert("Nome attività e indirizzo sono obbligatori");
      return;
    }

    // Aggiunto logo_url nell'insert
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        owner_id: ownerId,
        name: name.trim(),
        type: type.trim() || null,
        address: address.trim(),
        logo_url: logoUrl.trim() || null, 
        is_default: items.length === 0,
      })
      .select("id, name, type, address, logo_url, is_default, created_at")
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
    setLogoUrl(""); // Reset logo
  };

  const setDefault = async (id: string) => {
    if (!ownerId) return;

    const { error: e1 } = await supabase
      .from("businesses")
      .update({ is_default: false })
      .eq("owner_id", ownerId);

    if (e1) return;

    const { error: e2 } = await supabase
      .from("businesses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("owner_id", ownerId);

    if (e2) return;

    setItems((prev) =>
      prev.map((b) => ({ ...b, is_default: b.id === id }))
    );
  };

  if (!authChecked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest text-xs">
        Caricamento…
      </div>
    );
  }

  if (!ownerId) return null;

  return (
    <div className="p-4 space-y-5 pb-32">
      <h1 className="text-2xl font-black tracking-tighter">Le tue attività</h1>

      {/* CREATE FORM */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="font-bold text-slate-800">Nuova Impresa</div>
        <div className="space-y-3">
            <input className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-3 text-sm focus:outline-blue-500" placeholder="Nome attività" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-3 text-sm focus:outline-blue-500" placeholder="Tipo (es. Ristorante)" value={type} onChange={(e) => setType(e.target.value)} />
            <input className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-3 text-sm focus:outline-blue-500" placeholder="Indirizzo" value={address} onChange={(e) => setAddress(e.target.value)} />
            
            {/* Input per il Logo */}
            <div className="relative">
                <input className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-3 pl-10 text-sm focus:outline-blue-500" placeholder="URL Logo (es. https://logo.it/img.png)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                <IconPhoto size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
        </div>
        
        <button onClick={createBusiness} className="w-full rounded-2xl py-4 font-bold text-white bg-blue-600 shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          Salva attività
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              {/* Visualizzazione Logo */}
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {b.logo_url ? (
                  <img src={b.logo_url} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <IconBuildingSkyscraper size={24} className="text-slate-300" />
                )}
              </div>

              <div className="min-w-0">
                <div className="font-black text-slate-800 truncate">{b.name}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{b.type || "Attività"}</div>
                {b.is_default && (
                  <div className="mt-1 text-[10px] font-black inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 uppercase">
                    Principale
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setDefault(b.id)}
              className={`shrink-0 p-3 rounded-2xl border transition-colors ${b.is_default ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              <IconStar size={20} fill={b.is_default ? "currentColor" : "none"} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Icona stella rapida per il tasto default
function IconStar({ size, fill, className }: { size: number, fill: string, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z" />
        </svg>
    )
}