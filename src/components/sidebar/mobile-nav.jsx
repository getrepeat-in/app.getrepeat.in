"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { APP_SIDEBAR_CONFIG } from "@/constants/sidebar";

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const items = APP_SIDEBAR_CONFIG.navMain.items;
  const navItems = [
    items.find(i => i.title === "Live Orders"),
    items.find(i => i.title === "Menu"),
    items.find(i => i.title === "Orders"),
    items.find(i => i.title === "Settings"),
  ].filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[68px] pb-safe bg-white dark:bg-zinc-950 border-t border-border/40 flex items-center justify-around px-1 sm:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url));
        return (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground transition-all duration-200",
              isActive && "text-primary"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-8 rounded-full transition-all duration-200", 
              isActive && "bg-primary/10"
            )}>
              {item.icon && React.cloneElement(item.icon, { 
                className: cn("w-[22px] h-[22px] transition-all", isActive && "text-primary fill-primary/20 stroke-[2.5]") 
              })}
            </div>
            <span className={cn("text-[11px] font-medium leading-none tracking-tight transition-all", isActive && "font-semibold")}>
              {item.title}
            </span>
          </Link>
        );
      })}
      
      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground transition-all duration-200"
      >
        <div className="flex items-center justify-center w-10 h-8 rounded-full">
          <Menu className="w-[22px] h-[22px]" />
        </div>
        <span className="text-[11px] font-medium leading-none tracking-tight">More</span>
      </button>
    </div>
  );
}
