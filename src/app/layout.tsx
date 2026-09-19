import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/ui";
import GradualBlur from "@/components/GradualBlur";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "CAN’T STOP WATCHING ADS CREATE",
  description: "Brand dashboard for uploading and managing advertisements.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <StoreProvider>
          <Shell>{children}</Shell>
          <GradualBlur target="page" position="bottom" height="6rem" strength={2} divCount={5} curve="bezier" exponential opacity={1} />
        </StoreProvider>
      </body>
    </html>
  );
}
