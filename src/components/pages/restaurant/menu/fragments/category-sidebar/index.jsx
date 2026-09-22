"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CategoryView from "./category-view";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { BULK_EDIT_MODES } from "../bulk-editor/helpers/constants";
import { ChevronLeft, ChevronRight, LayoutList, Settings2 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

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
        <div className={`relative flex h-full transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[280px] sm:w-[300px]'} shrink-0 z-20`}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background shadow-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>

            <aside className={`flex h-full w-full flex-col border-r border-border/60 bg-card/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-xs overflow-hidden transition-all duration-300`}>
                <div className="p-3 border-b border-border/40">
                    <div className={cn("flex p-1 bg-gray-100/80 dark:bg-zinc-900/80 border border-gray-200/60 dark:border-zinc-800 rounded-lg w-full transition-all duration-300", isCollapsed ? "flex-col gap-1 items-center" : "items-center")}>
                        <button 
                            onClick={() => setActiveView("MENU")}
                            className={cn(
                                "rounded-md text-sm font-semibold transition-all flex justify-center items-center gap-2",
                                isCollapsed ? "w-10 h-10" : "flex-1 py-1.5 truncate",
                                activeView === "MENU" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs border border-orange-200 text-orange-600" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                            )}
                            title="Menu"
                        >
                            {isCollapsed ? <LayoutList size={18} /> : "Menu"}
                        </button>
                        <button 
                            onClick={() => {
                                setActiveView("BULK");
                                if (!activeBulkMode) setActiveBulkMode("PRICE");
                            }}
                            className={cn(
                                "rounded-md text-sm font-semibold transition-all flex justify-center items-center gap-2",
                                isCollapsed ? "w-10 h-10" : "flex-1 py-1.5 truncate",
                                activeView === "BULK" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs border border-orange-200 text-orange-600" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                            )}
                            title="Bulk Editor"
                        >
                            {isCollapsed ? <Settings2 size={18} /> : "Bulk Editor"}
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
                            isCollapsed={isCollapsed}
                        />
                    ) : (
                        <TooltipProvider delayDuration={200}>
                            <div className="flex flex-col gap-1 w-full">
                                {BULK_EDIT_MODES.map((mode) => {
                                    const Icon = mode.icon;
                                    const isActive = activeBulkMode === mode.id;
                                    
                                    const button = (
                                        <button
                                            onClick={() => setActiveBulkMode(mode.id)}
                                            className={cn(
                                                "group relative flex w-full items-center gap-3.5 rounded-md transition-all duration-150 ease-out hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                                                isActive 
                                                    ? "bg-primary/10 text-primary dark:bg-primary/15 font-semibold shadow-xs before:absolute before:-left-3 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-primary" 
                                                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium",
                                                isCollapsed ? "justify-center p-0 mx-auto w-9 h-9" : "px-3.5 py-2.5"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex size-5 items-center justify-center shrink-0 transition-colors [&>svg]:size-4.5", 
                                                isActive 
                                                    ? "text-primary [&>svg]:stroke-[2.2]" 
                                                    : "text-muted-foreground/80 group-hover:text-foreground [&>svg]:stroke-[1.8]"
                                            )}>
                                                <Icon />
                                            </div>
                                            {!isCollapsed && (
                                                <span className="flex-1 text-left text-[13.5px] truncate">
                                                    {mode.label}
                                                </span>
                                            )}
                                        </button>
                                    );

                                    return isCollapsed ? (
                                        <Tooltip key={mode.id}>
                                            <TooltipTrigger asChild>
                                                {button}
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                {mode.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <div key={mode.id} className="w-full">
                                            {button}
                                        </div>
                                    );
                                })}
                            </div>
                        </TooltipProvider>
                    )}
                </div>
            </aside>
        </div>
    );
}