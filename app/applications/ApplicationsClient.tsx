"use client";

// ✅ qui dentro puoi usare useSearchParams liberamente
import { useSearchParams } from "next/navigation";
import ApplicationsPageUI from "@/components/ApplicationsPage"; // se già lo usi

export default function ApplicationsClient() {
  const sp = useSearchParams(); // se serve davvero
  return <ApplicationsPageUI />;
}