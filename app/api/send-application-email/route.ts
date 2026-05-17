import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId" },
        { status: 400 }
      );
    }

    // PRENDI DATI LAVORO
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("role, location, employer_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // PRENDI EMAIL DATORE
    const { data: employer } = await supabase.auth.admin.getUserById(
      job.employer_id
    );

    const employerEmail = employer.user?.email;

    if (!employerEmail) {
      return NextResponse.json(
        { error: "Employer email missing" },
        { status: 400 }
      );
    }

    // INVIA EMAIL
    await resend.emails.send({
      from: "ExtraJobs <notifications@extrajobs.app>",
      to: employerEmail,
      subject: "Nuova candidatura ricevuta",
      html: `
        <div style="font-family:sans-serif">
          <h2>Hai ricevuto una nuova candidatura 🎉</h2>

          <p>
            Un worker si è candidato per:
          </p>

          <div style="padding:16px;border:1px solid #eee;border-radius:12px">
            <strong>${job.role}</strong><br/>
            ${job.location}
          </div>

          <p style="margin-top:20px">
            Accedi a ExtraJobs per vedere i dettagli.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}