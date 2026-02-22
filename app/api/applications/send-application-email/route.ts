import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response("Missing jobId", { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const resendKey = process.env.RESEND_API_KEY!;

    if (!supabaseUrl || !serviceKey || !resendKey) {
      console.error("Missing env vars", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceKey,
        hasResendKey: !!resendKey,
      });
      return new Response("Server misconfigured", { status: 500 });
    }

    // ✅ client SERVER (service role)
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1️⃣ Prendi info lavoro + employer_id
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("id, role, employer_id")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      console.error("Job not found", jobErr);
      return new Response("Job not found", { status: 400 });
    }

    // 2️⃣ (opzionale) Prendi nome attività/datoredal profilo
    const { data: employerProfile } = await supabase
      .from("profiles")
      .select("name, surname")
      .eq("id", job.employer_id)
      .single();

    const employerDisplayName =
      `${employerProfile?.name ?? ""} ${employerProfile?.surname ?? ""}`.trim() || "Datore";

    // 3️⃣ ✅ Prendi EMAIL del datore da auth.users via Admin API
    const { data: adminUser, error: adminErr } =
      await supabase.auth.admin.getUserById(job.employer_id);

    if (adminErr) {
      console.error("Admin getUserById error:", adminErr);
      return new Response("Cannot load employer user", { status: 500 });
    }

    const employerEmail = adminUser?.user?.email;

    if (!employerEmail) {
      return new Response("No employer email", { status: 400 });
    }

    // 4️⃣ Invia email con Resend
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "extraJob <noreply@extrajob.app>",
        to: employerEmail,
        subject: "Nuova candidatura ricevuta 🎉",
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.4">
            <h2>Hai ricevuto una nuova candidatura!</h2>
            <p>Ciao ${escapeHtml(employerDisplayName)},</p>
            <p>Qualcuno si è candidato per:</p>
            <p><b>${escapeHtml(job.role)}</b></p>
            <p>Accedi a extraJob per vedere i dettagli.</p>
          </div>
        `,
      }),
    });

    if (!resendResp.ok) {
      const errText = await resendResp.text().catch(() => "");
      console.error("Resend error:", resendResp.status, errText);
      return new Response("Email send failed", { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return new Response("Server error", { status: 500 });
  }
}

/** mini helper per evitare html injection */
function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}