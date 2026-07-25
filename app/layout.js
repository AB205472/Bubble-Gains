import "./globals.css";

export const metadata = {
  title: "Bubble",
  description: "Live your life. Bubble organizes it.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Bubble", statusBarStyle: "default" }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
