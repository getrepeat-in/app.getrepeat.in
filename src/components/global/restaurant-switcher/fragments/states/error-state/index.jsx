import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"

const ErrorState = ({ error, refetch, isFetching }) => {
    return (
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem>
                <div className="space-y-3 rounded-md border border-destructive/10 bg-destructive/5 p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent">
                    <div className="flex items-start gap-3 group-data-[collapsible=icon]:justify-center">
                        <AlertCircle className="mt-0.5 size-4 text-destructive shrink-0" />
                        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                            <p className="text-sm font-semibold text-destructive">Something Went Wrong.</p>
                            <p className="text-muted-foreground mt-0.5 text-xs leading-normal">
                                {error?.response?.data?.message || error?.message || "Something went wrong."}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-background hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 h-8 text-xs group-data-[collapsible=icon]:hidden"
                        onClick={refetch}
                        disabled={isFetching}
                        >
                        <RefreshCw className={`mr-2 size-3.5 ${isFetching ? "animate-spin" : ""}`} />
                        Retry Connection
                    </Button>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default ErrorState