import { useState } from "react";
import CategoryCard from "../category-card";
import Loader from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { useCategory } from "@/store/hooks/useCategory";
import EmptyState from "@/components/global/empty-state";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { FolderPlus, Plus, UtensilsCrossed } from "lucide-react";
import { CategoryFormPopover } from "../fragments/category-form-popover";

const CategoryView = ({ activeCategory, setActiveCategory, activeSubCategory, setActiveSubCategory, isCollapsed }) => {
    const { restaurantId } = useRestaurant();
    const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategory(restaurantId);
    const [expandedCategoryId, setExpandedCategoryId] = useState(null);
    const addSubCategory = addCategory;
    const updateSubCategory = updateCategory;
    const deleteSubCategory = deleteCategory;

    if (isLoading || !restaurantId) {
        return (
            <div className="flex items-center justify-center min-h-[200px] w-full">
                <Loader />
            </div>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="p-2">
                <EmptyState
                    icon={FolderPlus}
                    title="No Categories"
                    description="Add categories to structure your menu items."
                    size="sm"
                    action={
                        <CategoryFormPopover onSubmit={addCategory}>
                            <Button size="sm" className="h-8 text-xs font-medium rounded-md gap-1.5 w-full">
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
        <div className="space-y-2">
            <TooltipProvider delayDuration={200}>
                <button
                    onClick={() => {
                        setActiveCategory(null);
                        setActiveSubCategory(null);
                        setExpandedCategoryId(null);
                    }}
                    className={`group flex items-center gap-3 p-3 mb-2 rounded-xl border transition-all duration-300 w-full text-left ${
                        !activeCategory ? 'border-orange-200 dark:border-orange-900/50 bg-gradient-to-r from-orange-50/80 to-white dark:from-orange-950/20 dark:to-zinc-900 shadow-sm ring-1 ring-orange-500/10' : 'border-border/40 bg-white/50 dark:bg-zinc-900/50 hover:border-border/80 hover:bg-white hover:shadow-sm'
                    }`}
                >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                        !activeCategory ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 scale-105' : 'bg-gray-100/80 dark:bg-zinc-800 text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-zinc-700'
                    }`}>
                        <UtensilsCrossed className={`transition-transform ${!activeCategory ? 'h-4.5 w-4.5' : 'h-4 w-4'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-bold transition-colors ${!activeCategory ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900'}`}>
                            All Items
                        </p>
                        <p className="text-[10px] text-muted-foreground">Entire menu</p>
                    </div>
                </button>
                {categories?.map((category, index) => (
                    <CategoryCard 
                        key={category.id || index} 
                        category={category} 
                        index={index}
                        isExpanded={expandedCategoryId === category.id}
                        onToggleExpand={() =>
                            setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)
                        }
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        activeSubCategory={activeSubCategory}
                        setActiveSubCategory={setActiveSubCategory}
                        updateCategory={updateCategory}
                        deleteCategory={deleteCategory}
                        addSubCategory={addSubCategory}
                        updateSubCategory={updateSubCategory}
                        deleteSubCategory={deleteSubCategory}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </TooltipProvider>
        </div>
    );
};

export default CategoryView;