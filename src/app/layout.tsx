import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/layout/Header"
import MobileNav from "@/components/layout/MobileNav"
import Footer from "@/components/layout/Footer"
import ClientWrapper from "@/components/auth/ClientWrapper"
import LanguageProvider from "@/components/LanguageProvider"
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
    default: "星旅 StarTrail — 首尔 Kpop 追星足迹地图",
    template: "%s — 星旅 StarTrail",
  },
  description:
    "星旅 StarTrail — 探索首尔数百个 Kpop 追星地点。找到 BTS、BLACKPINK、TWICE 等偶像的拍摄地、同款餐厅、专辑店和娱乐公司。规划你的专属追星路线。",
  keywords: [
    "星旅 首尔 kpop 地图",
    "kpop filming locations",
    "bts seoul spots",
    "kpop itinerary",
    "seoul kpop tour",
    "kpop album shops seoul",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "星旅 StarTrail — 首尔 Kpop 追星足迹",
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
        <LanguageProvider>
        <ClientWrapper>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </ClientWrapper>
        </LanguageProvider>
      </body>
    </html>
  )
}
