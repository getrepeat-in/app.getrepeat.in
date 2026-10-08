"use client";
import { store } from "@/store";
import { Provider } from "react-redux";
import { AppClerkProvider } from "./clerk";
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
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

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(console.error);
    }
  }, []);

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


