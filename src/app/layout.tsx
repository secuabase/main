import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/shell/ThemeProvider";
import { PostHogProvider } from "@/lib/observability/posthog-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Secuabase", template: "%s · Secuabase" },
  description: "Proof for every product. Done for you.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2634B9" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1346" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <PostHogProvider>{children}</PostHogProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
