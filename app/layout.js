import "./globals.css";
import "./notifications.css";
import "./whimsy.css";
import "./approved-design.css";
import PwaRegister from "./pwa-register";
import BubbleVision from "./bubble-vision";
import NotificationSettings from "./notification-settings";

export const viewport = {
  themeColor: "#f7f3eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export const metadata = {
  title: { default: "Bubble Gains", template: "%s · Bubble Gains" },
  description: "A romantic botanical journal for tending to your real-life progress.",
  applicationName: "Bubble Gains",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    shortcut: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "512x512", type: "image/png" }]
  },
  appleWebApp: { capable: true, title: "Bubble Gains", statusBarStyle: "default" },
  formatDetection: { telephone: false }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><PwaRegister /><BubbleVision /><NotificationSettings />{children}</body></html>;
}