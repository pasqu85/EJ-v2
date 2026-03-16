import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
console.log("METADATA:", session.metadata);
    const userId = session.metadata?.userId;
    const jobData = JSON.parse(session.metadata?.jobData || "{}");

    const { error } = await supabase.from("jobs").insert({
      ...jobData,
      employer_id: userId,
    });

    if (error) {
      console.error("SUPABASE ERROR:", error);
    } else {
      console.log("JOB CREATED");
    }
  }

  return new Response("ok", { status: 200 });
}