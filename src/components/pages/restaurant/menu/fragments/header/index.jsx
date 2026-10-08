"use client";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import { exportMenuToCSV } from "./helpers/csvExport";
import { useQueryClient } from "@tanstack/react-query";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { Plus, RefreshCw, UtensilsCrossed, ArrowLeft, MoreVertical, Download } from "lucide-react";
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
    activeCategoryId,
    activeSubCategoryId,
    onClearCategory,
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

    let mobileTitle = "All Items";
    if (activeCategoryId && rawCategories) {
        const cat = rawCategories.find(c => c.id === activeCategoryId || c._id === activeCategoryId);
        if (cat) {
            mobileTitle = cat.name;
            if (activeSubCategoryId) {
                const sub = cat.subcategories?.find(s => s.id === activeSubCategoryId || s._id === activeSubCategoryId);
                if (sub) mobileTitle = sub.name;
            }
        }
    }

    let itemCount = items?.length || 0;
    if (activeSubCategoryId && items) {
        itemCount = items.filter(item => {
            const subId = item.subCategory?._id || item.subCategory?.id || item.subCategory;
            return String(subId) === String(activeSubCategoryId);
        }).length;
    }

    const defaultActions = (
        <div className="flex items-center gap-2 flex-nowrap w-full sm:w-auto overflow-hidden justify-between sm:justify-start">
            {activeCategoryId ? (
                <Button variant="ghost" size="sm" onClick={onClearCategory} className="sm:hidden gap-1.5 text-muted-foreground hover:text-foreground h-8.5 px-2 -ml-2 shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </Button>
            ) : (
                <div className="flex sm:hidden flex-1 min-w-0 mr-2 items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 border border-orange-100 dark:border-orange-900/50 shrink-0">
                        <UtensilsCrossed className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <span className="text-[15px] font-bold truncate text-gray-900 dark:text-gray-100 leading-tight">
                            {mobileTitle}
                        </span>
                        <span className="text-[11px] font-semibold text-orange-600/80 dark:text-orange-400">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2 flex-nowrap">
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
                            className="h-9 rounded-md bg-primary hover:bg-primary/90 text-white shadow-xs gap-1.5 font-bold text-xs shrink-0 transition-all hover:scale-[1.02]"
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
                className="h-9 w-9 p-0 sm:w-auto sm:px-3 rounded-lg border-gray-200 dark:border-zinc-800 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 shrink-0 gap-1.5 transition-colors"
                title="Refresh menu"
            >
                <RefreshCw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline text-xs font-semibold">Refresh</span>
            </Button>

            <div className="hidden sm:block">
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
            </div>
        </div>
    );

    return (
        <TableToolbar
            title={title}
            subtitle={subtitle}
            totalCount={totalCount}
            actions={actions !== undefined ? actions : defaultActions}
            searchable={false}
            hideTitleOnMobile={true}
            className={className}
        />
    );
}
