import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTheme from "@/providers/NextTheme";
import { Toaster } from "@/components/ui/toaster";
import QueryClientProv from "@/providers/QueryClientProv";
import { EdgeStoreProvider } from "@/lib/edgestore";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="min-h-screen" lang="en">
      <body className={inter.className}>
        <NextTheme>
          <EdgeStoreProvider>
            <QueryClientProv>
              {children}
              <Toaster />
            </QueryClientProv>
          </EdgeStoreProvider>
        </NextTheme>
      </body>
    </html>
  );
}
