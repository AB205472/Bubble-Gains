import "./globals.css";
import "./notifications.css";
import "./whimsy.css";
import "./approved-design.css";
import "./becoming.css";
import PwaRegister from "./pwa-register";
import BubbleVision from "./bubble-vision";
import NotificationSettings from "./notification-settings";
import BecomingBrand from "./becoming-brand";

export const viewport = {
  themeColor: "#fffaf3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export const metadata = {
  title: { default: "Becoming", template: "%s · Becoming" },
  description: "A private digital garden for self-discovery, discipline, self-love, and becoming the person you deserve to be.",
  applicationName: "Becoming",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    shortcut: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "512x512", type: "image/png" }]
  },
  appleWebApp: { capable: true, title: "Becoming", statusBarStyle: "default" },
  formatDetection: { telephone: false }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><PwaRegister /><BecomingBrand /><BubbleVision /><NotificationSettings />{children}</body></html>;
}
