import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projector",
  description:
    "Projekte starten, gemeinsam brainstormen, zusammen umsetzen — die Plattform für kollektive Projekte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap gap-x-6 gap-y-1 px-4 py-4 text-xs text-muted">
            <span>© {new Date().getFullYear()} Projector</span>
            <Link href="/impressum" className="hover:underline">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:underline">
              Datenschutz
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
