import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/provider";
import { fontPoppins } from "@/constants/fonts";
import { appMetadata } from "@/constants/metadata";

import { Toaster } from "sonner";

export const metadata = appMetadata;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", fontPoppins.variable)}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
