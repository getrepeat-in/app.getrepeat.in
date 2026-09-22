import { useState, useEffect } from "react";
import CategoryCard from "../category-card";
import Loader from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { FolderPlus, Plus } from "lucide-react";
import { useCategory } from "@/store/hooks/useCategory";
import EmptyState from "@/components/global/empty-state";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { CategoryFormPopover } from "../fragments/category-form-popover";

const CategoryView = ({ activeCategory, setActiveCategory, activeSubCategory, setActiveSubCategory, isCollapsed }) => {
    const { restaurantId } = useRestaurant();
    const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategory(restaurantId);
    const [expandedCategoryId, setExpandedCategoryId] = useState(null);
 
    useEffect(() => {
        if (categories?.length > 0 && !activeCategory) {
            const firstCategory = categories[0];
            Promise.resolve().then(() => {
                setExpandedCategoryId(firstCategory.id);
                setActiveCategory(firstCategory.id);
                if (firstCategory.subcategories?.length > 0 && !activeSubCategory) {
                    setActiveSubCategory(firstCategory.subcategories[0].id);
                }
            });
        }
    }, [categories, activeCategory, activeSubCategory, setActiveCategory, setActiveSubCategory]);

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