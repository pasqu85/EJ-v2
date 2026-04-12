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

    // ✅ 1. Mappatura corretta per Supabase
    // Questo risolve l'errore "Could not find the 'business' column"
    // const { data: job, error } = await supabase
    //   .from("jobs")
    //   .insert({
    //     role: jobData.role,
    //     location: jobData.location,
    //     pay: jobData.pay,
    //     start_date: jobData.startDate, // Assicurati che sia in formato ISO string
    //     end_date: jobData.endDate,     // Assicurati che sia in formato ISO string
    //     business_name: jobData.businessName, // Mappa businessName su business_name
    //     employer_id: userId,
    //     // status: "pending",
    //   })
    //   .select()
    //   .single();

    // if (error) {
    //   console.error("SUPABASE INSERT ERROR:", error);
    //   return NextResponse.json({ error: error.message }, { status: 500 });
    // }

const baseUrl = "https://www.extrajobs.app";

    // ✅ 2. Crea sessione Checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Pubblicazione annuncio: ${jobData.role}`,
            },
            unit_amount: 100, // 1.00€
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/employer/success`,
      cancel_url: `${baseUrl}/employer`,

      // ✅ Usa jobData (che hai estratto sopra) invece di body
metadata: {
  role: jobData.role,
  location: jobData.location,
  pay: jobData.pay,
  startDate: jobData.startDate,
  endDate: jobData.endDate,
  businessName: jobData.businessName,
  userId: userId,
}
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}