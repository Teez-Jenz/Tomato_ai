import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tomato AI Farm Assistant | Plant Health & Disease Diagnosis",
  description:
    "AI-powered tomato health diagnostic system for farmers. Combines Plant.id computer vision with Google Gemini for actionable treatment plans and agronomic advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="flex items-center gap-1">
              <span className="font-semibold text-emerald-700">Tomato AI</span> • School Project Demonstration (Plant.id + Gemini + Supabase)
            </p>
            <p>
              Designed for smallholder tomato farmers • Always confirm severe blight with local agronomists
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
