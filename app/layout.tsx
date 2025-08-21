import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppFrame } from "@/components/app-frame";

const defaultUrl = process.env.NEXT_PUBLIC_DOMAIN ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Tile",
  description: "An app to help you focus on what truly matters. 4 goals, daily check-offs, and friends to keep you motivated.",

  // PWA
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" }
  ],

  // IOS status bar
  appleWebApp: { 
    capable: true,
    statusBarStyle: "black-translucent"
  }
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex justify-center ${geistSans.className} antialiased sm:bg-secondary`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppFrame>
            {children}
          </AppFrame>
        </ThemeProvider>
      </body>
    </html>
  );
}
