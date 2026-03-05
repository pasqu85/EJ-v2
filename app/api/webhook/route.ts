import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
const signature = headerList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  // ✅ EVENTO PAGAMENTO COMPLETATO
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata;

    if (!metadata) {
      return NextResponse.json({ received: true });
    }

    const jobData = JSON.parse(metadata.jobData);

    const { error } = await supabase.from("jobs").insert({
      user_id: metadata.userId,
      role: jobData.role,
      location: jobData.location,
      pay: jobData.pay,
      start_date: jobData.startDate,
      end_date: jobData.endDate,
      business_name: jobData.business?.name || null,
      business_address: jobData.business?.address || null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
    }
  }

  return NextResponse.json({ received: true });
}