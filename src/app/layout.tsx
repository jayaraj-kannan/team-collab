import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workspace | Collab",
  description: "Team coordination platform integrated with Google Workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
