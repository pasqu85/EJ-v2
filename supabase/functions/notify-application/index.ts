


// supabase/functions/notify-application/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { type, application_id } = await req.json();

    if (!type || !application_id) {
      return new Response(JSON.stringify({ error: "Missing type/application_id" }), { status: 400 });
    }

    // 1) prendi application + job + employer + worker profile
    const { data: app, error: appErr } = await supabase
      .from("applications")
      .select(`
        id,
        created_at,
        job_id,
        worker_id,
        jobs:jobs (
          id,
          role,
          employer_id
        ),
        worker:profiles!applications_worker_id_fkey (
          id,
          name,
          surname,
          phone
        )
      `)
      .eq("id", application_id)
      .single();

    if (appErr || !app?.jobs) {
      return new Response(JSON.stringify({ error: appErr?.message ?? "Application not found" }), { status: 404 });
    }

    // 2) prendi contatti datore
    const employerId = (app.jobs as any).employer_id as string;

    const { data: employer, error: empErr } = await supabase
      .from("profiles")
      .select("id, name, surname, phone")
      .eq("id", employerId)
      .single();

    if (empErr) {
      return new Response(JSON.stringify({ error: empErr.message }), { status: 500 });
    }

    const worker = (app as any).worker;

    // 3) crea “notifica” DB (poi la userai in UI)
    const title =
      type === "applied" ? "Nuova candidatura" : "Candidatura annullata";

    const message =
      type === "applied"
        ? `${worker?.name ?? "Utente"} ${worker?.surname ?? ""} si è candidato per: ${(app.jobs as any).role}`
        : `${worker?.name ?? "Utente"} ${worker?.surname ?? ""} ha annullato la candidatura per: ${(app.jobs as any).role}`;

    await supabase.from("notifications").insert({
      user_id: employerId,
      title,
      message,
      meta: {
        type,
        application_id,
        job_id: app.job_id,
        worker_id: app.worker_id,
      },
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Error" }), { status: 500 });
  }
});