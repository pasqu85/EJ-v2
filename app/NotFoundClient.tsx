"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function NotFoundClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams.get("from");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-6">
      <h1 className="text-4xl font-bold">404</h1>

      <p className="text-gray-600">
        Pagina non trovata
        {from ? ` (${from})` : ""}
      </p>

      <button
        onClick={() => router.push("/")}
        className="px-6 py-3 rounded-full bg-emerald-500 text-white font-semibold"
      >
        Torna alla Home
      </button>
    </div>
  );
}