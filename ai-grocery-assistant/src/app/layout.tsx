import "@fontsource-variable/nunito";
import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/components/AppProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprig · your grocery neighbour",
  description: "Tell Sprig what you're making and get a grocery cart you can check before anything is sent.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF5EC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppProvider>
          <div className="app">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
}
