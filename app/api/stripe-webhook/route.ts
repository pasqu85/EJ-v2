import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Assicurati che il nome sia corretto (o SUPABASE_SERVICE_ROLE_KEY)
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ FIRMA NON VALIDA: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Ignoriamo gli eventi che non ci interessano (rispondendo 200)
  if (event.type !== "checkout.session.completed") {
    console.log(`ℹ️ Evento ignorato: ${event.type}`);
    return new Response("Event ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log("✅ SESSIONE COMPLETATA. METADATA:", session.metadata);

  const userId = session.metadata?.userId;
  const jobDataRaw = session.metadata?.jobData;

  // Controllo di sicurezza
  if (!userId || !jobDataRaw) {
    console.error("❌ DATI MANCANTI NEI METADATA:", { userId, jobDataRaw });
    return new Response("Missing metadata fields", { status: 400 });
  }

  try {
    const jobData = JSON.parse(jobDataRaw);

const { error: dbError } = await supabase.from("jobs").insert({
  employer_id: userId,
  role: jobData.role,
  location: jobData.location,
  pay: jobData.pay,
  start_date: jobData.startDate,
  end_date: jobData.endDate,
  business_name: jobData.business_name, // <-- ORA SALVERÀ IL NOME VERO
});

    if (dbError) {
      console.error("❌ ERRORE SUPABASE:", dbError.message);
      return new Response("Database Error", { status: 500 });
    }

    console.log("🚀 LAVORO SALVATO CON SUCCESSO!");
    return new Response("Success", { status: 200 });

  } catch (parseError) {
    console.error("❌ ERRORE PARSING JSON:", parseError);
    return new Response("Invalid JSON in metadata", { status: 400 });
  }
}