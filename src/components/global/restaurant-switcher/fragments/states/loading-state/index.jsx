import { Skeleton } from "@/components/ui/skeleton";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

const LoadingState = () => {
  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <div className="flex items-center gap-3 rounded-md border border-border/40 bg-sidebar-accent/20 p-2.5 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:justify-center">
          <Skeleton className="h-8.5 w-8.5 rounded-md shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-2.5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-4 w-4 rounded-md opacity-40 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default LoadingState;