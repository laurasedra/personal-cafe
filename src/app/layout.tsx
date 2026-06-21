import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UmamiAnalytics } from '@/app/components/UmamiAnalytics';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Cafe",
  description: "by Laura Sedra",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ]
  },
  verification: {
    other: {
      'fo-verify': '3b741765-a324-4c08-b43a-b9b755a85dd5',
      'Impact-Site-Verification': '9cae0fc2-8a15-4006-9ce6-ab3a5c2e7dbc',
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <UmamiAnalytics />
      </body>
    </html>
  );
}