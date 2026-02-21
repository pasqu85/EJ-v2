import { supabase } from "@/app/lib/supabaseClient";

/** Ritorna la lista dei job_id a cui mi sono candidato */
export async function getMyAppliedJobIds(): Promise<string[]> {
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();

  if (uErr) throw uErr;
  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select("job_id")
    .eq("worker_id", user.id);

  if (error) throw error;

  return (data ?? []).map((r: any) => r.job_id as string);
}

/** Candidatura (insert). Se già esiste, non rompe (gestione unique) */
export async function applyToJob(jobId: string) {
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();

  if (uErr) throw uErr;
  if (!user) throw new Error("Not logged in");

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    worker_id: user.id,
  });

  // unique(job_id, worker_id): se è già candidato, può dare errore 23505
  // lo trattiamo come "ok"
  if (error) {
    const msg = String((error as any).message ?? "");
    const code = String((error as any).code ?? "");
    if (code === "23505" || msg.toLowerCase().includes("duplicate")) return;
    throw error;
  }
}

/** Annulla candidatura (delete) */
export async function withdrawApplication(jobId: string) {
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();

  if (uErr) throw uErr;
  if (!user) throw new Error("Not logged in");

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("job_id", jobId)
    .eq("worker_id", user.id);

  if (error) throw error;
}