import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/app/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { jobData, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
            unit_amount: 100, // 1 euro
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        jobData: JSON.stringify(jobData),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/employer/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/employer`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore Stripe" }, { status: 500 });
  }
}