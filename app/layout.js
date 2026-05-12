import { Geist, Geist_Mono } from "next/font/google";
import "animate.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "flatpickr/dist/flatpickr.min.css";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "POS Multi Cabang",
  description: "Aplikasi Point of Sale modern berbasis Next.js 16",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
