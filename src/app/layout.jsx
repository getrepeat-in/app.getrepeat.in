import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Providers } from "@/provider";
import NextTopLoader from 'nextjs-toploader';
import { fontPoppins } from "@/constants/fonts";
import { appMetadata } from "@/constants/metadata";

export const metadata = appMetadata;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", fontPoppins.variable)}
    >
      <body className="min-h-screen bg-background text-foreground">
        <NextTopLoader color="#ea580c" showSpinner={false} />
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
