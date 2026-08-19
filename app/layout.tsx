import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EzTripx — Live Your Adventure",
    template: "%s | EzTripx",
  },
  description:
    "Discover destinations and buy travel document guides with EzTripx. Plan trips with curated PDF guides for travelers.",
  applicationName: "EzTripx",
  keywords: [
    "EzTripx",
    "travel guide",
    "document guide",
    "travel PDF",
    "destinasi wisata",
    "panduan travel",
  ],
  authors: [{ name: "EzTripx" }],
  creator: "EzTripx",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "EzTripx",
    title: "EzTripx — Live Your Adventure",
    description:
      "Discover destinations and buy travel document guides with EzTripx.",
    images: [
      {
        url: "/images/logo-eztripx.png",
        width: 512,
        height: 512,
        alt: "EzTripx",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "EzTripx — Live Your Adventure",
    description:
      "Discover destinations and buy travel document guides with EzTripx.",
    images: ["/images/logo-eztripx.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/logo-eztripx.png",
    apple: "/images/logo-eztripx.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (() => {
      try {
        const key = "eztripx-theme";
        const saved = localStorage.getItem(key);
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = saved ? saved === "dark" : prefersDark;
        document.documentElement.classList.toggle("dark", isDark);
      } catch {}
    })();
  `;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip bg-background text-foreground transition-colors">
        {children}
      </body>
    </html>
  );
}
