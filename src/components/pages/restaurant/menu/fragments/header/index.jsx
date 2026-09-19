"use client";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import { exportMenuToCSV } from "./helpers/csvExport";
import { useQueryClient } from "@tanstack/react-query";
import { useCategory } from "@/store/hooks/useCategory";
import { MoreVertical, Download, X } from "lucide-react";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { TableToolbar } from "@/components/global/table/fragments/table-toolbar";
import { CategoryFormPopover } from "../category-sidebar/fragments/category-form-popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuGroup } from "@/components/ui/dropdown-menu";

export default function MenuHeader({
    title = "Menu Management",
    subtitle = "Create and manage your restaurant categories, menu items, and pricing",
    totalCount,
    actions,
    onAddItem,
    onRefresh,
    className,
}) {
    const { restaurantId } = useRestaurant();
    const { rawCategories, addCategory } = useCategory(restaurantId);
    const { items } = useItem(restaurantId, {});
    const queryClient = useQueryClient();
    const notification = useNotification();

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        } else if (restaurantId) {
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
        }
    };

    const handleExportCSV = () => {
        exportMenuToCSV(items, rawCategories, notification);
    };

    const defaultActions = (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {onAddItem ? (
                <Button
                    onClick={onAddItem}
                    size="sm"
                    className="h-8.5 rounded-md bg-primary hover:bg-primary/90 text-white shadow-2xs gap-1.5 font-semibold text-xs shrink-0"
                >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Create Item</span>
                </Button>
            ) : (
                <CategoryFormPopover onSubmit={addCategory}>
                    <Button
                        size="sm"
                        className="h-8.5 rounded-md bg-primary hover:bg-primary/90 text-white shadow-2xs gap-1.5 font-semibold text-xs shrink-0"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                        <span>Create Category</span>
                    </Button>
                </CategoryFormPopover>
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0"
                title="Refresh menu"
            >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Refresh</span>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger render={
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8.5 w-8.5 p-0 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs shrink-0"
                        title="Actions"
                    >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                } />
                <DropdownMenuContent align="end" className="w-56 font-sans">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-bold px-2 py-1.5">Data & Sync</DropdownMenuLabel>
                        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer gap-2.5 font-medium py-2">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            Export Menu to CSV
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    return (
        <TableToolbar
            title={title}
            subtitle={subtitle}
            totalCount={totalCount}
            actions={actions !== undefined ? actions : defaultActions}
            searchable={false}
            className={className}
        />
    );
}
