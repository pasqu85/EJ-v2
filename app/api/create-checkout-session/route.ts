import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { jobData, userId } = await req.json();

    if (!jobData || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // ✅ 1. salva job in pending
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        ...jobData,
        employer_id: userId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.extrajobs.app";

    // ✅ 2. crea checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Pubblicazione annuncio lavoro",
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],

success_url: `${baseUrl}/employer?success=true`,
cancel_url: `${baseUrl}/employer`,

      // 🔥 SOLO ID
metadata: {
  userId,
  jobData: JSON.stringify(jobData),
},
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}