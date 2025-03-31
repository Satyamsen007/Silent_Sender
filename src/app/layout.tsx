import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: '400'
});


export const metadata: Metadata = {
  title: "Silent Sender – Send Anonymous Messages, Speak Freely!",
  description: "Silent Sender is a social platform that lets you send and receive anonymous messages effortlessly. Share your thoughts, give honest feedback, and express yourself without fear. Your voice matters—speak freely, stay anonymous!",
  icons: {
    icon: "/silentSenderlogo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body
          className={`${poppins.variable} font-poppins antialiased relative`}
        >
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}
