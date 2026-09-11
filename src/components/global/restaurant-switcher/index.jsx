"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RestaurantImage from "./fragments/image-card";
import { useSidebar } from "@/components/ui/sidebar";
import EmptyState from "./fragments/states/empty-state";
import ErrorState from "./fragments/states/error-state";
import LoadingState from "./fragments/states/loading-state";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { RestaurantService } from "@/services/frontend/restaurant";
import { Check, ChevronsUpDown, Search, Building2, MapPin } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RestaurantSwitcher = () => {
  const { isMobile } = useSidebar();
  const { restaurantId, setActiveRestaurant } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["all-restaurants"],
    queryFn: RestaurantService.getAllRestaurants,
    retry: false,
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} refetch={refetch} isFetching={isFetching} />;

  const entities = data?.data?.restaurants || data?.restaurants || [];

  if (entities.length === 0) return <EmptyState />;
  const selected = entities.find((r) => r._id === restaurantId) || entities[0];

  const filteredEntities = entities.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu
          onOpenChange={(open) => {
            if (!open) setSearchQuery("");
          }}
        >
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={selected?.name || "Select Restaurant"}
                className="group h-auto w-full items-center gap-3 overflow-hidden rounded-md border border-border/50 hover:border-border bg-sidebar-accent/30 hover:bg-sidebar-accent/70 p-2 shadow-2xs transition-all duration-200 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 data-[state=open]:ring-2 data-[state=open]:ring-primary/10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent"
              />
            }
          >
            <RestaurantImage restaurant={selected} className="rounded-md shrink-0" />

            <div className="grid min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
              <span className="truncate text-[13px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {selected?.name || "Select Restaurant"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate text-[11px] font-medium text-muted-foreground/80">
                  {selected?.address?.city || "Active Outlet"}
                </span>
              </div>
            </div>

            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
            sideOffset={8}
            className="w-[290px] rounded-md p-1.5 shadow-2xl border-border/60 bg-popover/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
          >
            <DropdownMenuGroup>
              <div className="px-2.5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground/70" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Your Outlets
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {entities.length}
                </span>
              </div>

              {entities.length > 2 && (
                <div className="px-1.5 pb-1.5">
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 size-3.5 text-muted-foreground/60 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search outlets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-full rounded-md bg-muted/60 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground/60 border border-transparent focus:border-border focus:bg-background focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1 bg-border/40" />

            <div className="max-h-[300px] overflow-y-auto space-y-1 p-0.5">
              {filteredEntities.length > 0 ? (
                filteredEntities.map((restaurant) => {
                  const active = restaurant._id === selected._id;

                  return (
                    <DropdownMenuItem
                      key={restaurant._id}
                      onClick={() => setActiveRestaurant(restaurant._id)}
                      className={`
                        flex items-center gap-3 cursor-pointer rounded-md px-2.5 py-2 transition-all duration-150
                        ${
                          active
                            ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                            : "hover:bg-muted/80 focus:bg-muted/80 text-foreground border border-transparent"
                        }
                      `}
                    >
                      <RestaurantImage restaurant={restaurant} className="h-8 w-8 rounded-md" />

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                          {restaurant.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground/75 flex items-center gap-1 mt-0.5">
                          <MapPin className="size-2.5 text-muted-foreground/50" />
                          {restaurant.address?.city || "No location"}
                        </p>
                      </div>

                      {active && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                          <Check className="size-3 stroke-[2.5]" />
                        </div>
                      )}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="px-3 py-6 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                  <Building2 className="size-6 text-muted-foreground/30" />
                  <p className="text-xs">No outlets found matching &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default RestaurantSwitcher;