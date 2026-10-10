"use client";
import { useState, useEffect } from "react";
import MenuHeader from "./fragments/header";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainContent } from "./fragments/main-content";
import { useCategory } from "@/store/hooks/useCategory";
import CategorySidebar from "./fragments/category-sidebar";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const Menu = () => {
    const { restaurantId } = useRestaurant();
    const { categories, isLoading: isCategoriesLoading, addCategory } = useCategory(restaurantId);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState(null);
    const [activeView, setActiveView] = useState("MENU");
    const [activeBulkMode, setActiveBulkMode] = useState("PRICE");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile && activeBulkMode !== "IMAGE") {
            setActiveBulkMode("IMAGE");
        }
    }, [isMobile, activeBulkMode]);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 sm:m-4 p-0 sm:p-4 space-y-0 sm:space-y-3 sm:rounded-md sm:border border-border/40 sm:shadow-xs min-w-0 h-[calc(100vh-68px)] sm:h-[calc(100vh-60px)]">
            <MenuHeader 
                className="px-3 pt-3 pb-3 sm:p-0"
                activeView={activeView}
                activeBulkMode={activeBulkMode}
                activeCategoryId={activeCategory}
                activeSubCategoryId={activeSubCategory}
                showMobileSidebar={showMobileSidebar}
                onAddItem={activeSubCategory ? () => document.dispatchEvent(new CustomEvent('ADD_MENU_ITEM')) : undefined}
                onClearCategory={() => {
                    setActiveCategory(null);
                    setActiveSubCategory(null);
                }}
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
            <div className="flex flex-row flex-1 bg-white overflow-hidden sm:border border-border/60 sm:rounded-md min-h-0 bg-background border-t border-b relative">
                <div className="hidden sm:block w-auto h-full shrink-0 z-20 border-r border-border/60">
                    <CategorySidebar 
                        activeCategory={activeCategory} 
                        setActiveCategory={setActiveCategory}
                        activeSubCategory={activeSubCategory}
                        setActiveSubCategory={setActiveSubCategory}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        activeBulkMode={activeBulkMode}
                        setActiveBulkMode={setActiveBulkMode}
                    />
                </div>
                
                <div className="bg-background flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
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
                            isMobile={isMobile}
                        />
                    </div>
                </div>
                
                <div className="sm:hidden fixed bottom-24 right-6 z-40">
                    <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                        <SheetTrigger
                            render={
                                <Button 
                                    className="rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.15)] bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-6 flex items-center gap-2 border border-primary/20"
                                />
                            }
                        >
                            <UtensilsCrossed size={16} />
                            <span className="font-bold text-[13px] tracking-wide uppercase">Menu</span>
                        </SheetTrigger>
                        <SheetContent 
                            side="bottom" 
                            className="p-0 flex flex-col rounded-t-[24px] !h-[60vh] outline-none"
                            style={{ height: '60vh' }}
                        >
                            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0" />
                            <SheetTitle className="sr-only">Menu Categories</SheetTitle>
                            <div className="flex-1 overflow-hidden min-h-0 flex flex-col mt-2">
                                <CategorySidebar 
                                    activeCategory={activeCategory} 
                                    setActiveCategory={setActiveCategory}
                                    activeSubCategory={activeSubCategory}
                                    setActiveSubCategory={(id) => {
                                        setActiveSubCategory(id);
                                        if (id) setIsMobileDrawerOpen(false);
                                    }}
                                    activeView={activeView}
                                    setActiveView={setActiveView}
                                    activeBulkMode={activeBulkMode}
                                    setActiveBulkMode={(id) => {
                                        setActiveBulkMode(id);
                                        if (id) setIsMobileDrawerOpen(false);
                                    }}
                                    isMobile={true}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    );
}

export default Menu;