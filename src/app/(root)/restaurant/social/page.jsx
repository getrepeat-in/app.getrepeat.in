import { Suspense } from "react";
import SocialPage from "@/components/pages/restaurant/social";
import { SocialSkeleton } from "@/components/pages/restaurant/social/fragments/SocialSkeleton";

export const metadata = {
  title: "Social Settings - Restaurant Dashboard",
  description: "Manage your restaurant's social integrations and post mappings.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-5 md:p-6 space-y-6 rounded-xl border border-border/40 shadow-xs min-w-0">
          <div className="border-b border-border/40 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
              Social Media & Instagram Feed
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Connect your Instagram account to sync reels, posts and make dishes directly shoppable for customers.
            </p>
          </div>
          <SocialSkeleton />
        </div>
      }
    >
      <SocialPage />
    </Suspense>
  );
}
