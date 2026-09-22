"use client";
import { AppSidebar } from "./index";
import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "../global/breadcrumb";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const HIDE_SIDEBAR_ROUTES = [
  "/restaurant/onboarding",
  "/sign-in",
  "/sign-up",
];

export function SidebarLayout({ children }) {
  const pathname = usePathname();
  const shouldHideSidebar = HIDE_SIDEBAR_ROUTES.some(route => pathname?.startsWith(route));
  const { restaurantId, restaurants } = useRestaurant();
  const activeRestaurant = restaurants?.find(r => r._id === restaurantId);
  const storefrontUrl = activeRestaurant?.slug ? `https://${activeRestaurant.slug}.getrepeat.in` : null;

  if (shouldHideSidebar) {
    return (
      <div className="min-h-screen w-full bg-gray-50/30 dark:bg-zinc-950 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/30 dark:bg-zinc-950">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4 sm:px-6 bg-white dark:bg-zinc-900 transition-[width,height] ease-linear min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 sm:-ml-2 shrink-0" />
            <div className="h-4 w-px bg-border/60 mx-1 sm:mx-2 shrink-0" />
            <div className="min-w-0 truncate">
              <Breadcrumbs />
            </div>
          </div>

          {storefrontUrl && (
            <a 
              href={storefrontUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary/90 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors shrink-0 ml-4"
            >
              Visit Website
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </header>
        
        <div className="flex-1 overflow-auto min-w-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
