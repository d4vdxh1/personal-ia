import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Día a Día",
  applicationName: "Día a Día",
  description: "Día a Día — Un paso más. Tu espacio personal para organizar tu rutina.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
