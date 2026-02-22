import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { job_id, worker_id } = await req.json();

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const RESEND_API_KEY = process.env.RESEND_API_KEY!;

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // prendo info lavoro + datore
    const { data: job, error: jErr } = await sb
      .from("jobs")
      .select("id, role, employer_id")
      .eq("id", job_id)
      .single();

    if (jErr || !job) throw jErr ?? new Error("Job not found");

    const { data: employerProfile, error: pErr } = await sb
      .from("profiles")
      .select("contact_email, name, surname")
      .eq("id", job.employer_id)
      .single();

    if (pErr) throw pErr;

    const to = employerProfile?.contact_email;
    if (!to) {
      return NextResponse.json({ ok: false, reason: "missing_employer_email" }, { status: 200 });
    }

    const resend = new Resend(RESEND_API_KEY);

    // NOTA: per test puoi usare onboarding@resend.dev;
    // per "noreply@tuodominio" devi verificare il dominio su Resend
    const from = process.env.MAIL_FROM ?? "onboarding@resend.dev";

    await resend.emails.send({
      from,
      to,
      subject: `Nuova candidatura per: ${job.role}`,
      html: `
        <div style="font-family:system-ui">
          <h2>Nuova candidatura</h2>
          <p>Hai ricevuto una nuova candidatura per <b>${job.role}</b>.</p>
          <p>Apri extraJob per vedere i dettagli.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 500 });
  }
}