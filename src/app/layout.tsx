import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phik'a Vehicle Protection",
  description: "Discover your vehicle's true value and protection benefits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}