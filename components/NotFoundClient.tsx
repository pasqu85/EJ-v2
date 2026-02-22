"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundClient() {
  const searchParams = useSearchParams();

  // Qui puoi usare searchParams senza errori.
  // Se vuoi la tua UI custom, incolla qui la grafica.

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-3xl font-bold">404</div>
        <div className="text-gray-600 mt-2">Pagina non trovata</div>
      </div>
    </main>
  );
}