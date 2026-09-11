"use client";
import { useClerk } from "@clerk/nextjs";
import { ChevronRightIcon, BadgeCheckIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NavUser({ user, menuItems }) {
  const { isMobile } = useSidebar();
  const { signOut } = useClerk();

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={user?.name || "Account"}
                className="group h-auto w-full items-center gap-3.5 overflow-hidden rounded-md border border-border/40 hover:border-border/80 bg-sidebar-accent/20 hover:bg-sidebar-accent/60 p-2 shadow-2xs transition-all duration-200 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 data-[state=open]:ring-2 data-[state=open]:ring-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent"
              />
            }
          >
            <Avatar className="size-8 sm:size-8.5 rounded-md border border-border/60 shadow-2xs ring-1 ring-border/20 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <AvatarImage
                src={user?.avatar}
                alt={user?.name}
                className="object-cover rounded-md"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-xs rounded-md">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 min-w-0 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {user?.name || "Account"}
                </span>
                <BadgeCheckIcon className="size-3.5 text-primary fill-primary/10 shrink-0" />
              </div>
              <span className="truncate text-[11px] font-medium text-muted-foreground/80 mt-0.5">
                {user?.email || "Signed in"}
              </span>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[280px] rounded-md border border-border/60 bg-popover/95 backdrop-blur-xl p-1.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={10}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 p-2 text-left">
                  <Avatar className="size-10 rounded-md border border-border/60 shadow-xs ring-1 ring-border/20">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.name}
                      className="object-cover rounded-md"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-xs rounded-md">
                      {user?.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 min-w-0 text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold tracking-tight text-foreground">
                        {user?.name}
                      </span>
                      <BadgeCheckIcon className="size-3.5 text-primary fill-primary/10 shrink-0" />
                    </div>
                    <span className="truncate text-[11px] font-medium text-muted-foreground/80 mt-0.5">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-border/40" />

            {menuItems && menuItems?.length > 0 && (
              <>
                <DropdownMenuGroup className="space-y-0.5">
                  {menuItems?.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      className="cursor-pointer rounded-md px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted/80 focus:bg-muted/80 transition-all"
                    >
                      <a
                        href={item?.url || "#"}
                        className="flex w-full items-center gap-2.5"
                      >
                        <div className="size-4 text-muted-foreground [&>svg]:size-4">
                          {item?.icon}
                        </div>
                        <span>{item?.title}</span>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-border/40" />
              </>
            )}

            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: "/" })}
              className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-all"
            >
              <LogOutIcon className="size-4 text-destructive transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="font-semibold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

