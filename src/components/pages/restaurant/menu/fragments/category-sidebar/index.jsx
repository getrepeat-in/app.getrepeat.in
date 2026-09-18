"use client";
import { useState } from "react";
import CategoryView from "./category-view";
import { useCategory } from "@/store/hooks/useCategory";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRestaurant } from "@/store/hooks/useRestaurant";

export default function CategorySidebar({
    activeCategory,
    setActiveCategory,
    activeSubCategory,
    setActiveSubCategory,
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
                <div className="flex-1 overflow-y-auto w-full p-3 pb-8">
                    <CategoryView 
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        activeSubCategory={activeSubCategory}
                        setActiveSubCategory={setActiveSubCategory}
                    />
                </div>
            </aside>
        </div>
    );
}