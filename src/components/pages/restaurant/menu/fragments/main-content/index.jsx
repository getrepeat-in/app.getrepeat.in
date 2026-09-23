import React from "react";
import { Button } from "@/components/ui/button";
import MenuItemList from "../items/menu-item-list";
import EmptyState from "@/components/global/empty-state";
import { ImageEditor } from "../bulk-editor/ImageEditor";
import { PriceEditor } from "../bulk-editor/PriceEditor";
import { ImportEditor } from "../bulk-editor/ImportEditor";
import { AddonsEditor } from "../bulk-editor/AddonsEditor";
import { DescriptionEditor } from "../bulk-editor/DescriptionEditor";
import { StructureOrganizer } from "../bulk-editor/StructureOrganizer";
import { UtensilsCrossed, Plus, FolderTree, ArrowLeft } from "lucide-react";
import { CategoryFormPopover } from "../category-sidebar/fragments/category-form-popover";

export function MainContent({
    activeView,
    activeCategory,
    activeSubCategory,
    activeBulkMode,
    categories,
    isCategoriesLoading,
    addCategory,
    onBack
}) {
    const renderContent = () => {
        if (activeView === "MENU") {
            if (activeSubCategory) {
                return (
                    <MenuItemList 
                        activeCategoryId={activeCategory}
                        activeSubCategoryId={activeSubCategory}
                    />
                );
            }

            if (!isCategoriesLoading && (!categories || categories.length === 0)) {
                return (
                    <div className="flex-1 flex items-center justify-center w-full p-4 h-full dark:bg-zinc-950">
                        <EmptyState
                            icon={UtensilsCrossed}
                            title="No Categories Found"
                            description="You haven't got any categories in your menu yet."
                            className={"h-full w-full"}
                            action={
                                <CategoryFormPopover onSubmit={addCategory}>
                                    <Button size="sm" className="h-8 text-xs font-medium rounded-md gap-1.5 shadow-xs">
                                        <Plus className="size-3.5" />
                                        Create Category
                                    </Button>
                                </CategoryFormPopover>
                            }
                        />
                    </div>
                );
            }

            return (
                <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-zinc-950">
                    <EmptyState
                        icon={FolderTree}
                        className={"h-full w-full"}
                        title="No Subcategory Selected"
                        description="Select a subcategory from the sidebar to view its menu items."
                    />
                </div>
            );
        }

        if (activeView === "BULK") {
            switch (activeBulkMode) {
                case "PRICE":
                    return <PriceEditor />;
                case "DESCRIPTION":
                    return <DescriptionEditor />;
                case "STRUCTURE":
                    return <StructureOrganizer />;
                case "ADDONS":
                    return <AddonsEditor />;
                case "IMAGE":
                    return <ImageEditor />;
                case "IMPORT":
                    return <ImportEditor />;
                default:
                    return (
                        <div className="flex-1 flex items-center justify-center bg-background dark:bg-zinc-950 text-muted-foreground">
                            <p className="text-sm font-medium">Select a bulk edit tool from the sidebar</p>
                        </div>
                    );
            }
        }

        return null;
    };

    return (
        <div className="flex flex-col h-full w-full relative">
            <div className="sm:hidden flex items-center p-2 border-b border-border/60 bg-muted/30">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground h-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to menu
                </Button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                {renderContent()}
            </div>
        </div>
    );
}
