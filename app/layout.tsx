import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imagely",
  description: "Create, enhance, and transform images and videos with powerful AI tools.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <Navigation />
            <div className="flex-1 flex flex-col">{children}</div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
