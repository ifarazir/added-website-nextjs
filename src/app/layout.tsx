import type { Metadata } from "next";
import { Manrope, Titillium_Web } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

/** Core typeface — navigation, product names and body copy. */
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-manrope",
  display: "swap",
});

/** Display typeface — large headings and section titles only. */
const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-titillium",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ADDED FORMS — Interior accessories",
    template: "%s — ADDED FORMS",
  },
  description:
    "ADDED FORMS is a studio for interior accessories in stainless steel, iron, aluminium and wood. Minimal, architectural, material-driven objects made to stay.",
  openGraph: {
    type: "website",
    siteName: "ADDED FORMS",
    locale: "en",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${titillium.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
