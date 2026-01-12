import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Option Store",
  description: "The best choice is no choice. Only the #1 bestseller from every Amazon category.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
