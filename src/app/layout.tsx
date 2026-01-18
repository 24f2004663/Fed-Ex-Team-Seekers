import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FedEx-Recovery",
  description: "AI-Driven Debt Collections Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <footer className="w-full py-6 mt-8 border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="font-semibold text-gray-800">Contact & Queries</h3>
            <p className="text-gray-600 mt-1">
              Email: <a href="mailto:teamseekers01@gmail.com" className="text-[var(--color-primary)] hover:underline">teamseekers01@gmail.com</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
