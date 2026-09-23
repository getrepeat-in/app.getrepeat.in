"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import MenuHeader from "./fragments/header";
import { MainContent } from "./fragments/main-content";
import { useCategory } from "@/store/hooks/useCategory";
import CategorySidebar from "./fragments/category-sidebar";
import { useRestaurant } from "@/store/hooks/useRestaurant";

const Menu = () => {
    const { restaurantId } = useRestaurant();
    const { categories, isLoading: isCategoriesLoading, addCategory } = useCategory(restaurantId);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState(null);
    const [activeView, setActiveView] = useState("MENU");
    const [activeBulkMode, setActiveBulkMode] = useState("PRICE");
    const [showMobileSidebar, setShowMobileSidebar] = useState(true);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 space-y-3 rounded-md border border-border/40 shadow-xs min-w-0 h-[calc(100vh-60px)]">
            <MenuHeader 
                activeView={activeView}
                activeBulkMode={activeBulkMode}
                onBackToMenu={() => {
                    setActiveView("MENU");
                    setShowMobileSidebar(true);
                }}
                onOpenBulkMode={(modeId) => {
                    setActiveView("BULK");
                    setActiveBulkMode(modeId);
                    setShowMobileSidebar(true);
                }}
            />
            <div className="flex flex-row flex-1 bg-white overflow-hidden border border-border/60 rounded-md min-h-0 bg-background">
                <div className={cn("w-full sm:w-auto h-full sm:h-auto sm:block shrink-0 z-20 border-r border-border/60", showMobileSidebar ? "block" : "hidden")}>
                    <CategorySidebar 
                        activeCategory={activeCategory} 
                        setActiveCategory={setActiveCategory}
                        activeSubCategory={activeSubCategory}
                        setActiveSubCategory={(id) => {
                            setActiveSubCategory(id);
                            if (id) setShowMobileSidebar(false);
                        }}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        activeBulkMode={activeBulkMode}
                        setActiveBulkMode={(id) => {
                            setActiveBulkMode(id);
                            if (id) setShowMobileSidebar(false);
                        }}
                    />
                </div>
                
                <div className={cn("bg-background flex-1 flex flex-col p-3 min-w-0 min-h-0 overflow-hidden", !showMobileSidebar ? "flex" : "hidden sm:flex")}>
                    <div className="bg-white flex-1 flex flex-col min-h-0 overflow-hidden rounded-md">
                        <MainContent 
                            activeView={activeView}
                            activeCategory={activeCategory}
                            activeSubCategory={activeSubCategory}
                            activeBulkMode={activeBulkMode}
                            categories={categories}
                            isCategoriesLoading={isCategoriesLoading}
                            addCategory={addCategory}
                            onBack={() => setShowMobileSidebar(true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Menu;