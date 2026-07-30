import "./globals.css";
import PwaRegister from "./pwa-register";
import BubbleVision from "./bubble-vision";

export const viewport = {
  themeColor: "#eee8ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export const metadata = {
  title: { default: "Bubble", template: "%s · Bubble" },
  description: "Live your life. Bubble organizes it.",
  applicationName: "Bubble",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  appleWebApp: { capable: true, title: "Bubble", statusBarStyle: "default" },
  formatDetection: { telephone: false }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><PwaRegister /><BubbleVision />{children}</body></html>;
}
