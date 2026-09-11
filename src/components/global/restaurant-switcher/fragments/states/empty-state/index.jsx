import { Store } from "lucide-react"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"

const EmptyState = () => {
    return (
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem>
                <div className="rounded-xl border border-dashed p-4 text-center bg-muted/20 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent">
                    <Store className="mx-auto size-5 text-muted-foreground/70" />
                    <p className="text-sm font-medium mt-1 group-data-[collapsible=icon]:hidden">No Restaurants Found</p>
                    <p className="text-muted-foreground mt-1 text-xs max-w-[200px] mx-auto leading-normal group-data-[collapsible=icon]:hidden">
                        We couldn&apos;t find any restaurants associated with this account.
                    </p>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default EmptyState