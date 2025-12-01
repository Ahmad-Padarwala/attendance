import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Staff Attendance System",
  description: "Manage staff attendance with location tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

