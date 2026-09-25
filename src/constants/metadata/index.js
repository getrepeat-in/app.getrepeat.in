const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.getrepeat.in";

export const appMetadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GetRepeat | Restaurant Management & Digital QR Ordering",
    template: "%s | GetRepeat",
  },
  description:
    "All-in-one restaurant management platform with POS, QR ordering, Kitchen Display System (KDS), menu management, table reservations, and social integrations.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "GetRepeat | Restaurant Management & Digital QR Ordering",
    description:
      "All-in-one restaurant management platform with POS, QR ordering, Kitchen Display System (KDS), menu management, table reservations, and social integrations.",
    url: siteUrl,
    siteName: "GetRepeat",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GetRepeat - Repeat Visits. Repeat Values.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetRepeat | Restaurant Management & Digital QR Ordering",
    description:
      "All-in-one restaurant management platform with POS, QR ordering, Kitchen Display System (KDS), menu management, table reservations, and social integrations.",
    images: ["/og-image.png"],
  },
};

export default appMetadata;
