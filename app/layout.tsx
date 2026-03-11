import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

import DynamicBackground from "../components/DynamicBackground";
import MantineProviderClient from "../components/MantineProviderClient";
import AppShell from "@/components/AppShell";
import AuthListener from "@/components/AuthListener";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "extraJob",
  description: "Piattaforma di lavoro extra per studenti e lavoratori part-time",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <MantineProviderClient>
          <main className="relative z-10">
            <DynamicBackground />
            <AuthListener />

            {/* ✅ IMPORTANTISSIMO: AppShell usa useSearchParams */}
            <Suspense fallback={null}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </main>
        </MantineProviderClient>
        <SpeedInsights />
      </body>
    </html>
  );
}