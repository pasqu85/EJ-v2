// app/job/[id]/page.tsx
import { supabase } from "@/app/lib/supabaseClient";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// 1. Genera i Metadata Dinamici per Google
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!job) return { title: "Lavoro non trovato" };

  return {
    title: `${job.role} a ${job.location} | extraJob`,
    description: `Offerta di lavoro extra come ${job.role} presso ${job.business_name || 'Attività'}. Paga: ${job.pay}. Candidati su extraJob!`,
    openGraph: {
      images: ['/logo2.png'],
    },
  };
}

// 2. La Pagina che vede l'utente
export default async function JobPage({ params }: { params: { id: string } }) {
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <Image src="/logo2.png" width={50} height={50} alt="Logo" />
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {job.role}
            </h1>
            <p className="text-emerald-500 font-bold">{job.business_name}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Dove</span>
            <span className="text-lg font-bold text-slate-700">{job.location}</span>
          </div>

          <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Paga</span>
            <span className="text-2xl font-black text-emerald-600">{job.pay}</span>
          </div>

          <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quando</span>
            <span className="text-lg font-bold text-slate-700">
              {new Date(job.start_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/" className="block w-full py-4 bg-slate-900 text-white text-center rounded-2xl font-black hover:bg-emerald-500 transition-colors">
            ACCEDI PER CANDIDARTI
          </Link>
          <p className="text-center text-xs text-slate-400 mt-4 font-bold uppercase tracking-tighter">
            extraJob — Il lavoro extra, semplificato.
          </p>
        </div>
      </div>
    </main>
  );
}