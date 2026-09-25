"use client";
import { ClerkProvider } from "@clerk/nextjs";

export function AppClerkProvider({ children }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoImageUrl: "/assets/logo/getrepeat-logo.webp",
          logoPlacement: "inside",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

