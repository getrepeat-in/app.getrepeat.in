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
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg shadow-sm"
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
