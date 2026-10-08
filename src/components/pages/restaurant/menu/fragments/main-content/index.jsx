import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import MenuItemList from "../items/menu-item-list";
import EmptyState from "@/components/global/empty-state";
import { UtensilsCrossed, Plus, FolderTree } from "lucide-react";
import { CategoryFormPopover } from "../category-sidebar/fragments/category-form-popover";

const ImageEditor = dynamic(() => import("../bulk-editor/ImageEditor").then(m => m.ImageEditor), { loading: () => <div className="flex-1 flex items-center justify-center p-6"><Loader /></div> });
const PriceEditor = dynamic(() => import("../bulk-editor/PriceEditor").then(m => m.PriceEditor), { loading: () => <div className="flex-1 flex items-center justify-center p-6"><Loader /></div> });
const ImportEditor = dynamic(() => import("../bulk-editor/ImportEditor").then(m => m.ImportEditor), { loading: () => <div className="flex-1 flex items-center justify-center p-6"><Loader /></div> });
const AddonsEditor = dynamic(() => import("../bulk-editor/AddonsEditor").then(m => m.AddonsEditor), { loading: () => <div className="flex-1 flex items-center justify-center p-6"><Loader /></div> });
const DescriptionEditor = dynamic(() => import("../bulk-editor/DescriptionEditor").then(m => m.DescriptionEditor), { loading: () => <div className="flex-1 flex items-center justify-center p-6"><Loader /></div> });
const StructureOrganizer = dynamic(() => import("../bulk-editor/StructureOrganizer").then(m => m.StructureOrganizer), { loading: () => <div className="flex-1 flex items-center justify-center p-6"><Loader /></div> });

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
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const renderContent = () => {
        if (!mounted) {
            return (
                <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-zinc-950">
                     <Loader />
                </div>
            );
        }

        if (activeView === "MENU") {
            if (!isCategoriesLoading && (!categories || categories.length === 0)) {
                return (
                    <div className="flex-1 flex items-center justify-center w-full p-1 h-full dark:bg-zinc-950">
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
                <MenuItemList 
                    activeCategoryId={activeCategory}
                    activeSubCategoryId={activeSubCategory}
                />
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
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                {renderContent()}
            </div>
        </div>
    );
}
