"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CategoryView from "./category-view";
import { useCategory } from "@/store/hooks/useCategory";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { BULK_EDIT_MODES } from "../bulk-editor/helpers/constants";

export default function CategorySidebar({
    activeCategory,
    setActiveCategory,
    activeSubCategory,
    setActiveSubCategory,
    activeView,
    setActiveView,
    activeBulkMode,
    setActiveBulkMode,
}) {
    const { restaurantId } = useRestaurant();
    const { addCategory } = useCategory(restaurantId);

    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div className={`relative flex h-full transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-[280px] sm:w-[300px]'} shrink-0 z-20`}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background shadow-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>

            <aside className={`flex h-full w-[280px] sm:w-[300px] flex-col border-r border-border/60 bg-card/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-xs overflow-hidden transition-transform duration-300 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
                <div className="p-3 border-b border-border/40">
                    <div className="flex items-center p-1 bg-gray-100/80 dark:bg-zinc-900/80 border border-gray-200/60 dark:border-zinc-800 rounded-lg w-full">
                        <button 
                            onClick={() => setActiveView("MENU")}
                            className={cn(
                                "flex-1 py-1.5 rounded-md text-sm font-semibold transition-all",
                                activeView === "MENU" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs border border-orange-200 text-orange-600" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                            )}
                        >
                            Menu
                        </button>
                        <button 
                            onClick={() => {
                                setActiveView("BULK");
                                if (!activeBulkMode) setActiveBulkMode("PRICE");
                            }}
                            className={cn(
                                "flex-1 py-1.5 rounded-md text-sm font-semibold transition-all",
                                activeView === "BULK" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs border border-orange-200 text-orange-600" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                            )}
                        >
                            Bulk Editor
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto w-full p-3 pb-8">
                    {activeView === "MENU" ? (
                        <CategoryView 
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            activeSubCategory={activeSubCategory}
                            setActiveSubCategory={setActiveSubCategory}
                        />
                    ) : (
                        <div className="flex flex-col gap-1 w-full">
                            {BULK_EDIT_MODES.map((mode) => {
                                const Icon = mode.icon;
                                const isActive = activeBulkMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => setActiveBulkMode(mode.id)}
                                        className={cn(
                                            "flex flex-col gap-2 p-3 text-left transition-all duration-200 outline-none border-b border-border/40 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-md",
                                            isActive && "bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn("p-1.5 rounded-md", isActive ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400")}>
                                                <Icon size={14} />
                                            </div>
                                            <span className={cn("text-sm font-semibold font-sans tracking-tight", isActive ? "text-orange-700 dark:text-orange-400" : "text-gray-700 dark:text-zinc-300")}>
                                                {mode.label}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}