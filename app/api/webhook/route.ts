import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Errore Firma:", err.message);
    return new Response("Webhook Error", { status: 400 });
  }

  // ✅ accettiamo SOLO questo evento
  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;

    // 🔐 1. CONTROLLO PAGAMENTO
    if (session.payment_status !== "paid") {
      console.log("⚠️ Pagamento non completato");
      return new Response("Not paid", { status: 200 });
    }

    // 🔐 2. CONTROLLO METADATA
    if (!session.metadata?.jobData || !session.metadata?.userId) {
      console.error("❌ Metadata mancanti:", session.metadata);
      return new Response("Missing metadata", { status: 200 });
    }

    const userId = session.metadata.userId;

    let jobData;
    try {
      jobData = JSON.parse(session.metadata.jobData);
    } catch (err) {
      console.error("❌ JSON parse error");
      return new Response("Invalid JSON", { status: 200 });
    }

    // 🔐 3. ANTI-DOPPIO INSERIMENTO (IMPORTANTISSIMO)
    const { data: existing } = await supabase
      .from("jobs")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Già salvato, skip");
      return new Response("Already processed", { status: 200 });
    }

    // ✅ SALVATAGGIO
    const { error: dbError } = await supabase.from("jobs").insert({
      employer_id: userId,
      role: jobData.role,
      location: jobData.location,
      pay: jobData.pay,
      start_date: jobData.startDate,
      end_date: jobData.endDate,
  // 👇 QUESTI OK
  business_id: jobData.business?.id || null,
  business_name: jobData.business?.name || null,
  business_type: jobData.business?.type || null,
  business_address: jobData.business?.address || null,

      // 🔥 fondamentale per evitare duplicati
      stripe_session_id: session.id,
    });

    if (dbError) {
      console.error("❌ Errore DB:", dbError.message);
      return new Response("DB Error", { status: 200 }); // 👈 MAI 500
    }

    console.log("✅ JOB SALVATO!");
    return new Response("Success", { status: 200 });

  } catch (err: any) {
    console.error("🔥 Crash:", err.message);
    return new Response("Error", { status: 200 }); // 👈 MAI 500
  }
}