"use client";

import { useState, useEffect } from "react";
import Loader from "@/components/global/loader";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { renderTabContent, TABS } from "./helpers";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { RestaurantService } from "@/services/frontend/restaurant";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { restaurantId } = useRestaurant();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant-details", restaurantId],
    queryFn: () => RestaurantService.getRestaurantById(restaurantId),
    enabled: !!restaurantId,
  });

  if (!isMounted) {
    return (
      <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
        <div className="flex items-center justify-center min-h-[350px] w-full">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-4 sm:p-5 md:p-6 space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 pb-5 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
              Restaurant Profile & Settings
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              Manage your restaurant branding, physical location, opening hours, and configuration
            </p>
          </div>
        </div>

        {/* Pill Tabs with generous padding */}
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 dark:bg-zinc-900/80 border border-gray-200/60 dark:border-zinc-800 rounded-md overflow-x-auto scrollbar-none max-w-full w-fit">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs font-semibold"
                    : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                )}
              >
                {Icon && (
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? "text-primary dark:text-orange-400"
                        : "text-gray-400 dark:text-zinc-500"
                    }
                  />
                )}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      "ml-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border",
                      tab.badgeClasses || "bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div key={activeTab} className="animate-in fade-in-50 duration-200 min-w-0">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px] w-full">
            <Loader />
          </div>
        ) : (
          renderTabContent(activeTab, data)
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
