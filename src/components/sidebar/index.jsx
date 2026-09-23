"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import { APP_SIDEBAR_CONFIG } from "@/constants/sidebar";
import { useActiveUser } from "@/store/hooks/useActiveUser";
import RestaurantSwitcher from "../global/restaurant-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";

export function AppSidebar(props) {
  const { user: userData, isLoaded } = useActiveUser();

  const sidebarConfig = {
    user: {
      avatar: userData?.avatar || "",
      name: userData?.name || "",
      email: userData?.email || "",
    },
  };

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar border-r border-border/40">
      <SidebarHeader className="p-3 pb-1.5 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:items-center">
        <RestaurantSwitcher />
      </SidebarHeader>
      <SidebarContent className="px-1.5 py-1 group-data-[collapsible=icon]:px-0">
        <NavMain
          title={APP_SIDEBAR_CONFIG?.navMain?.title}
          items={APP_SIDEBAR_CONFIG?.navMain?.items}
        />
      </SidebarContent>
      <SidebarSeparator className="mx-3 my-1.5 bg-border/40 group-data-[collapsible=icon]:mx-1" />
      {isLoaded && (
        <SidebarFooter className="p-3 pt-1.5 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:items-center flex flex-col gap-2">
          <Link 
            href="/restaurant/onboarding" 
            className="flex items-center gap-2 px-3 text-md font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Onboard New Outlet</span>
          </Link>
          <NavUser
            user={sidebarConfig?.user}
            menuItems={APP_SIDEBAR_CONFIG?.navUserItems}
          />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
