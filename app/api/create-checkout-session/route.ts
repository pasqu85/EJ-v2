import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {

  const { jobData, userId } = await req.json();

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

    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/employer`,

    metadata: {
      userId,
      jobData: JSON.stringify(jobData),
    },
  });

  return NextResponse.json({ url: session.url });
}