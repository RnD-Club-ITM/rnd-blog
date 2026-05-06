import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/theme-provider"
import { IntroAnimation } from "@/components/layout/IntroAnimation"
import { SwipeNavigator } from "@/components/layout/SwipeNavigator"
import ConvexClientProvider from "@/components/ConvexClientProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-head",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPARK - Ignite Ideas. Build Together. Prove Your Work.",
  description:
    "The ONLY platform combining peer-curated research, authentic storytelling, verifiable portfolios, and collaborative community—built for Gen Z engineers.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SwipeNavigator />
              <IntroAnimation>
                {children}
              </IntroAnimation>
              <Toaster richColors closeButton />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
