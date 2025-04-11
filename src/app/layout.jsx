import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: '400'
});

export const metadata = {
  title: "Silent Sender – Send Anonymous Messages, Speak Freely!",
  description: "Silent Sender is a social platform that lets you send and receive anonymous messages effortlessly. Share your thoughts, give honest feedback, and express yourself without fear. Your voice matters—speak freely, stay anonymous!",
  icons: {
    icon: [
      { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/favicons/android-chrome-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/favicons/android-chrome-512x512.png' },

      { rel: "icon", type: "image/ico", url: "/favicons/favicon.ico", },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicons/favicon-16x16.png", },
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicons/favicon-32x32.png", },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
  manifest: '/favicons/site.webmanifest',
};

export default function RootLayout({ children }) {
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
