"use client";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const previousUserId = useRef(null);

  useEffect(() => {
    if (!isLoaded || !isPostHogConfigured) return;

    if (!user) {
      if (previousUserId.current) {
        posthog.reset();
        previousUserId.current = null;
      }
      return;
    }

    if (previousUserId.current === user.id) return;

    if (previousUserId.current) {
      posthog.reset();
    }

    posthog.identify(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || user.firstName || undefined,
    });
    previousUserId.current = user.id;
  }, [isLoaded, user]);

  return null;
}

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
      <PostHogIdentity />
      {children}
    </ClerkProvider>
  );
}

