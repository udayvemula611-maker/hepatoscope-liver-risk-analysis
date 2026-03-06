import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liver Analysis | Advanced Medical Liver Analysis",
  description: "An AI-powered SaaS platform for Doctors and Patients to perform predictive, non-invasive liver risk analysis and generate actionable health reports.",
  keywords: ["medical SaaS", "liver disease", "AI analysis", "health tech", "Next.js", "Supabase"],
  authors: [{ name: "Uday Vemula" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
