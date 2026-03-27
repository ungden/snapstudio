import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ClientLayoutWrapper } from "@/components/client-layout-wrapper";
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
  title: "SnapStudio - AI Product Image Generator | 1 Photo → 12 Professional Marketing Images",
  description: "Transform 1 product photo into a professional marketing image set in 30 seconds. 4 styles: Display, Model, Social, Seeding. Save 99% on studio costs.",
  keywords: ["AI images", "product photography", "marketing", "AI", "photo studio", "e-commerce", "social media"],
  authors: [{ name: "SnapStudio Team" }],
  creator: "SnapStudio",
  publisher: "SnapStudio",
  
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://snapstudio.app",
    siteName: "SnapStudio",
    title: "SnapStudio - AI Product Image Generator",
    description: "Transform 1 product photo into 12 professional marketing images in 30 seconds. Save 99% on studio costs.",
    images: [
      {
        url: "https://snapstudio.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SnapStudio - AI Product Image Generator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@snapstudio_app",
    creator: "@snapstudio_app",
    title: "SnapStudio - AI Product Image Generator",
    description: "Transform 1 product photo into 12 professional marketing images in 30 seconds. Save 99% on studio costs.",
    images: ["https://snapstudio.app/og-image.jpg"],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  verification: {
    google: "your-google-verification-code",
  },
  
  applicationName: "SnapStudio",
  category: "Business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="canonical" href="https://snapstudio.app" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}