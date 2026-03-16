import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {

  const { jobData, userId } = await req.json();
    const origin =
    req.headers.get("origin") || "https://www.extrajobs.app";


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
          unit_amount: 100, // 1€
        },
        quantity: 1,
      },
    ],
success_url: `${origin}/employer?success=true`,
cancel_url: `${origin}/employer`,

    metadata: {
      userId,
      jobData: JSON.stringify(jobData),
    },
  });

  return NextResponse.json({ url: session.url });
}