import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadFlow — Automated Lead Management System",
  description:
    "Capture, track, and analyze leads with automated email delivery, open tracking, click tracking, and AI-powered classification.",
  keywords: ["lead management", "email tracking", "CRM", "analytics"],
  authors: [{ name: "LeadFlow" }],
  openGraph: {
    title: "LeadFlow — Automated Lead Management",
    description: "Enterprise-grade lead capture and email tracking system.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased bg-slate-50 min-h-screen">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
