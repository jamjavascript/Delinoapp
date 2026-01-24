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
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold">
                  D
                </div>
                <div>
                  <p className="text-lg font-semibold">Delinoapp</p>
                  <p className="text-xs text-gray-500">Product insights</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                  Demo Data
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  FastAPI + Next.js
                </span>
              </div>
            </div>
          </header>

          <div className="flex flex-1">
            <aside className="hidden md:flex w-64 border-r bg-white">
              <div className="flex flex-col w-full p-6 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                    Navigation
                  </p>
                  <nav className="space-y-2 text-sm">
                    <a
                      href="/"
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
                    >
                      Dashboard
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Home
                      </span>
                    </a>
                    <a
                      href="/"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                      Categories
                      <span className="text-xs text-gray-400">View</span>
                    </a>
                    <a
                      href="/"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                      Refresh Jobs
                      <span className="text-xs text-gray-400">Queue</span>
                    </a>
                  </nav>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-800 mb-1">Need data?</p>
                  <p>
                    Use the refresh action on the dashboard to sync the latest products.
                  </p>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </div>
          </div>

          <footer className="border-t bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500">
              <p>Built with FastAPI, Next.js, and PostgreSQL.</p>
              <p>© 2026 Delinoapp. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
