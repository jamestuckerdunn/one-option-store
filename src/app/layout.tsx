import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Option Store | #1 Bestsellers Only",
  description: "The best choice is no choice. Only the #1 bestseller from every Amazon category. Stop comparing, start deciding.",
  keywords: "amazon bestsellers, best products, top rated, #1 products, online shopping",
  openGraph: {
    title: "One Option Store | #1 Bestsellers Only",
    description: "The best choice is no choice. Only the #1 bestseller from every Amazon category.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black font-sans">
        {children}
      </body>
    </html>
  );
}
