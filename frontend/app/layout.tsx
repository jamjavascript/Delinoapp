import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import NavSidebar from "@/components/NavSidebar";
import HeaderAuth from "@/components/HeaderAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delinoapp Products",
  description: "Product tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a href="/" className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold">
                      D
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Delinoapp</p>
                      <p className="text-xs text-gray-500">Product insights</p>
                    </div>
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                      Demo Data
                    </span>
                  </div>
                  <HeaderAuth />
                </div>
              </div>
            </header>

            <div className="flex flex-1">
              <NavSidebar />

              <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </div>
            </div>

            <footer className="border-t bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500">
                <p>Built with FastAPI, Next.js, and PostgreSQL.</p>
                <p>&copy; 2026 Delinoapp. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
