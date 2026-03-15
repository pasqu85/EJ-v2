"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) return;

    fetch("/api/confirm-payment", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">Pagamento completato 🎉</h1>
        <p className="text-gray-600">
          Il tuo annuncio verrà pubblicato a breve.
        </p>
      </div>
    </div>
  );
}