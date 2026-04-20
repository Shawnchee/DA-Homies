import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consilium — AI Decision Copilot for Vet Clinics",
  description:
    "Consilium is an AI copilot for solo vet clinics: pre-consult briefs, structured notes, and autonomous owner follow-ups.",
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
