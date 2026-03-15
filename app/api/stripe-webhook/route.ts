import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  
  // ✅ CORREZIONE: Prima attendi headers(), poi chiami .get()
  const headerPayload = await headers();
  const sig = headerPayload.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const jobData = JSON.parse(session.metadata?.jobData || "{}");

    // ✅ Verifica che l'utente esista prima di procedere
    if (!userId) {
      console.error("User ID mancante nei metadata della sessione");
      return NextResponse.json({ error: "No user id" }, { status: 400 });
    }

    const { error } = await supabase.from("jobs").insert({
      employer_id: userId,
      role: jobData.role,
      location: jobData.location,
      pay: jobData.pay,
      start_date: jobData.startDate,
      end_date: jobData.endDate,
      business_id: jobData.business?.id ?? null,
      business_name: jobData.business?.name ?? null,
      business_type: jobData.business?.type ?? null,
      business_address: jobData.business?.address ?? null,
    });

    if (error) {
      console.error("Errore Supabase durante l'inserimento:", error);
      // Restituiamo comunque un 200 a Stripe per evitare tentativi infiniti, 
      // ma logghiamo l'errore per il debug
    }
  }

  return NextResponse.json({ received: true });
}