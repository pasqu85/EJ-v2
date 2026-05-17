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
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
    
    <div style="background-color: #10b981; padding: 30px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
        extraJob
      </h2>
    </div>

    <div style="padding: 30px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 16px;">
        Nuova candidatura ricevuta! 🎉
      </h1>
      
      <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        Ottime notizie! Un worker ha appena inviato la sua candidatura per la tua posizione aperta.
      </p>

      <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0;">
        <span style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
          Posizione
        </span>
        <strong style="display: block; font-size: 18px; color: #0f172a; margin-bottom: 12px;">
          ${job.role}
        </strong>
        
        <div style="display: flex; align-items: center; color: #64748b; font-size: 14px; font-weight: 600;">
           📍 ${job.location}
        </div>
      </div>

      <div style="margin-top: 32px; text-align: center;">
        <a href="https://www.extrajob.it/employer" 
           style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; transition: all 0.2s;">
          Vedi Candidatura
        </a>
      </div>

      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px;">
        Non rispondere a questa email. Per gestire i tuoi annunci accedi alla tua area riservata.
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px;">
    <p style="color: #94a3b8; font-size: 12px;">
      © 2026 extraJob. Il lavoro extra, semplificato.
    </p>
  </div>
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