import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/layout/Header"
import MobileNav from "@/components/layout/MobileNav"
import Footer from "@/components/layout/Footer"
import ClientWrapper from "@/components/auth/ClientWrapper"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
}

export const metadata: Metadata = {
  title: {
    default: "Kpop Seoul Map — Discover Kpop Filming Locations & Idol Spots in Seoul",
    template: "%s — Kpop Seoul Map",
  },
  description:
    "Interactive map of 170+ Kpop locations in Seoul. Find BTS, BLACKPINK, TWICE filming spots, idol restaurants, album shops, and entertainment companies. Plan your Kpop trip with AI itinerary generator.",
  keywords: [
    "kpop seoul map",
    "kpop filming locations",
    "bts seoul spots",
    "kpop itinerary",
    "seoul kpop tour",
    "kpop album shops seoul",
  ],
  openGraph: {
    title: "Kpop Seoul Map — Discover Kpop Spots in Seoul",
    description: "Interactive map of 170+ Kpop locations. Plan your ultimate Kpop trip.",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <ClientWrapper>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </ClientWrapper>
      </body>
    </html>
  )
}
