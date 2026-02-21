import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; // Fondamentale per il DatePicker
import "./globals.css"; // Il tuo CSS (Tailwind) deve venire dopo
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import DynamicBackground from '../components/DynamicBackground';
import MantineProviderClient from "../components/MantineProviderClient";
import "./globals.css";
import AppShell from "@/components/AppShell";
import AuthListener from "@/components/AuthListener";
import AppBottomBars from "@/components/AppBottomBars";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "extraJob",
  description: "Piattaforma di lavoro extra per studenti e lavoratori part-time",
  icons: {
    icon: "/favicon.ico",
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="it">
      <title>extraJob</title>
      <meta name="description" content="Piattaforma di lavoro extra per studenti e lavoratori part-time" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <body>
        <MantineProviderClient>
          <main className="relative z-10">
            <DynamicBackground />
            <AuthListener />
            
            <AppShell>{children}</AppShell>
          </main>
        </MantineProviderClient>
      </body>
    </html>
  );
}

