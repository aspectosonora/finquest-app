import type { Metadata, Viewport } from "next";
import { Anton, Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { IOSActiveFix } from "@/components/pwa/IOSActiveFix";
import { EffectsProvider } from "@/lib/effects/EffectsProvider";
import { CelebrationHost } from "@/components/effects/CelebrationHost";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinQuest · Juntos subimos de nivel",
  description:
    "FinQuest: la aventura financiera en pareja de Julio y Cinthya. Ahorro, deudas y metas, en equipo.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/assets/identidad/icono_app_finquest_192.png",
    apple: "/assets/identidad/icono_app_finquest_180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinQuest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1746f5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${anton.variable} ${barlowCondensed.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#c7cbd4] text-ink">
        <EffectsProvider>
          <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col overflow-x-hidden bg-mist-soft shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_20px_60px_rgba(0,0,0,0.25)]">
            {children}
          </div>
          <CelebrationHost />
        </EffectsProvider>
        <ServiceWorkerRegister />
        <IOSActiveFix />
      </body>
    </html>
  );
}
