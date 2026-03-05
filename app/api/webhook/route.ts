import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  
  // 1. Recupera gli headers in modo asincrono
  const headerList = await headers(); 
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId;
  const jobData = JSON.parse(session.metadata?.jobData || "{}");

  await supabase.from("jobs").insert({
    ...jobData,
    employer_id: userId,
    is_paid: true,
    stripe_session_id: session.id,
    paid_at: new Date(),
  });
}

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return new NextResponse(`Webhook error: ${err.message}`, { status: 400 });
  }

  // ... resto del codice
  return NextResponse.json({ received: true });
}