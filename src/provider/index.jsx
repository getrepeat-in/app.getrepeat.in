"use client";
import { store } from "@/store";
import { useState } from "react";
import { Provider } from "react-redux";
import { AppClerkProvider } from "./clerk";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationBanner from "@/components/global/notification-banner";
import { NewOrderAlertModal } from "@/components/global/new-order-modal";

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <AppClerkProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <NotificationBanner />
            {children}
            <NewOrderAlertModal />
          </TooltipProvider>
        </QueryClientProvider>
      </AppClerkProvider>
    </Provider>
  );
}


