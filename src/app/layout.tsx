import type { Metadata, Viewport } from "next";
import SkipLink from "@/components/layout/SkipLink";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneoptionstore.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "One Option Store - #1 Bestsellers from Every Amazon Category",
    template: "%s | One Option Store",
  },
  description: "The best choice is no choice. Discover the #1 bestselling product from every Amazon category. Updated daily with verified rankings.",
  keywords: ["Amazon bestsellers", "best products", "top rated", "product rankings", "bestselling items"],
  authors: [{ name: "One Option Store" }],
  creator: "One Option Store",
  publisher: "One Option Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "One Option Store",
    title: "One Option Store - #1 Bestsellers from Every Amazon Category",
    description: "The best choice is no choice. Discover the #1 bestselling product from every Amazon category.",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Option Store - #1 Bestsellers from Every Amazon Category",
    description: "The best choice is no choice. Discover the #1 bestselling product from every Amazon category.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
