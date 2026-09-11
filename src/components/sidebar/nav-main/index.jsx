"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({ title, items }) {
  const pathname = usePathname();

  const isItemActive = (itemUrl) => {
    if (!pathname || !itemUrl) return false;
    if (pathname === itemUrl) return true;
    if (itemUrl !== "/" && itemUrl !== "/restaurant" && pathname.startsWith(itemUrl)) {
      return true;
    }
    return false;
  };

  return (
    <SidebarGroup className="px-3 py-1.5 group-data-[collapsible=icon]:px-0">
      {title && (
        <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase select-none group-data-[collapsible=icon]:hidden">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
        {items?.map((item) => {
          const hasChildren = item?.items && item?.items.length > 0;
          const isChildActive = hasChildren && item.items.some((sub) => isItemActive(sub.url));
          const isActive = item?.isActive ?? (isItemActive(item?.url) || isChildActive);

          return hasChildren ? (
            <Collapsible
              key={item?.title}
              defaultOpen={isActive}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item?.title}
                    className={`group/btn relative flex items-center gap-3.5 rounded-md px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-150 ease-out hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:mx-auto ${
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-semibold shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-primary group-data-[collapsible=icon]:before:hidden group-data-[collapsible=icon]:ring-1 group-data-[collapsible=icon]:ring-primary/30"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  />
                }
              >
                <div
                  className={`flex size-5 items-center justify-center shrink-0 transition-colors [&>svg]:size-4.5 ${
                    isActive
                      ? "text-primary [&>svg]:stroke-[2.2]"
                      : "text-muted-foreground/80 group-hover/btn:text-foreground [&>svg]:stroke-[1.8]"
                  }`}
                >
                  {item?.icon}
                </div>
                <span className="flex-1 text-left truncate group-data-[collapsible=icon]:hidden">{item?.title}</span>
                <ChevronRightIcon className="size-4 opacity-50 transition-transform duration-200 group-data-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="mt-1 border-l border-border/60 pl-3.5 ml-4 space-y-1">
                  {item?.items?.map((subItem) => {
                    const isSubActive = isItemActive(subItem?.url);

                    return (
                      <SidebarMenuSubItem key={subItem?.title}>
                        <SidebarMenuSubButton
                          render={<Link href={subItem?.url} />}
                          className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all duration-150 ${
                            isSubActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          }`}
                        >
                          {subItem?.icon && (
                            <div className="flex size-4 items-center justify-center shrink-0 [&>svg]:size-3.5">
                              {subItem.icon}
                            </div>
                          )}
                          <span className="truncate">{subItem?.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item?.title}>
              <SidebarMenuButton
                render={<Link href={item?.url} />}
                isActive={isActive}
                tooltip={item?.title}
                className={`group/btn relative flex items-center gap-3.5 rounded-md px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-150 ease-out hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:mx-auto ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-semibold shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-primary group-data-[collapsible=icon]:before:hidden group-data-[collapsible=icon]:ring-1 group-data-[collapsible=icon]:ring-primary/30"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <div
                  className={`flex size-5 items-center justify-center shrink-0 transition-colors [&>svg]:size-4.5 ${
                    isActive
                      ? "text-primary [&>svg]:stroke-[2.2]"
                      : "text-muted-foreground/80 group-hover/btn:text-foreground [&>svg]:stroke-[1.8]"
                  }`}
                >
                  {item?.icon}
                </div>
                <span className="flex-1 text-left truncate group-data-[collapsible=icon]:hidden">{item?.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

