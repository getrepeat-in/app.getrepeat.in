"use client";
import { useState } from "react";
import { renderViewContent } from "./helper";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { CategoryFormPopover } from "./category-form-popover";
import { Layers, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export default function CategorySidebar({
    activeCategory,
    setActiveCategory,
    activeSubCategory,
    setActiveSubCategory,
    activeView,
    setActiveView,
    activeBulkMode,
    setActiveBulkMode
}) {
    const { restaurantId } = useRestaurant();
    const { addCategory } = useCategory(restaurantId);

    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div className={`relative flex h-full transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-[300px]'} shrink-0 z-20`}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background shadow-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>

            <aside className={`flex h-full w-[300px] flex-col border-r border-border/60 bg-card/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-xs overflow-hidden transition-transform duration-300 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
                {setActiveView && (
                    <div className="px-3.5 py-3 border-b border-border/60 bg-muted/20 shrink-0">
                        <div className="flex items-center justify-between gap-2">
                            <div className="grid grid-cols-2 gap-1 p-1 bg-muted/70 dark:bg-zinc-900 rounded-md flex-1 border border-border/40 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setActiveView("MENU")}
                                    className={`flex items-center justify-center gap-2 py-1.5 px-3 text-xs rounded-md transition-all duration-150 ${activeView === "MENU"
                                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:text-foreground font-medium"
                                        }`}
                                >
                                    <Layers className="size-3.5" />
                                    Menu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveView("BULK")}
                                    className={`flex items-center justify-center gap-2 py-1.5 px-3 text-xs rounded-md transition-all duration-150 ${activeView === "BULK"
                                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:text-foreground font-medium"
                                        }`}
                                >
                                    <SlidersHorizontal className="size-3.5" />
                                    Bulk Edit
                                </button>
                            </div>
                            {activeView === "MENU" && (
                                <div className="flex items-center gap-1 shrink-0">
                                    <CategoryFormPopover onSubmit={addCategory} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto w-full">
                    {renderViewContent({
                        activeView,
                        activeBulkMode,
                        setActiveBulkMode,
                        activeCategory,
                        setActiveCategory,
                        activeSubCategory,
                        setActiveSubCategory
                    })}
                </div>
            </aside>
        </div>
    );
}