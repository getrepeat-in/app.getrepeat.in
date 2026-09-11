"use client";
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
        <SidebarFooter className="p-3 pt-1.5 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:items-center">
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
