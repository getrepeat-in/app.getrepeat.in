"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import Loader from "@/components/global/loader";
import { useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/frontend/menu";
import { useCategory } from "@/store/hooks/useCategory";
import { SelectSources } from "./fragments/SelectSources";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { SelectDestination } from "./fragments/SelectDestination";

export function StructureOrganizer() {
    const { restaurantId } = useRestaurant();
    const { rawCategories: categories = [], isLoading: isLoadingCats, addCategory, updateCategory, deleteCategory } = useCategory(restaurantId);
    const { items = [], isLoading: isLoadingItems, deleteItem } = useItem(restaurantId, { fetchAll: true });
    
    const [selectedSources, setSelectedSources] = useState({ categories: [], subcategories: [], items: [] });
    const [targetDestination, setTargetDestination] = useState(null); // { id, type: 'category' | 'subcategory' | 'main' }
    const [isSaving, setIsSaving] = useState(false);
    
    const notification = useNotification();
    const queryClient = useQueryClient();

    const handleClearSelection = () => {
        setSelectedSources({ categories: [], subcategories: [], items: [] });
        setTargetDestination(null);
    };

    const standaloneItems = selectedSources.items.filter(itemId => {
        const itemObj = items.find(i => String(i._id || i.id) === String(itemId));
        if (!itemObj) return true;
        const subId = itemObj.subCategory?._id || itemObj.subCategory;
        return !selectedSources.subcategories.includes(String(subId));
    });

    const handleConfirmMove = async () => {
        if (!restaurantId) return;
        const totalSelected = selectedSources.categories.length + selectedSources.subcategories.length + selectedSources.items.length;
        if (totalSelected === 0) {
            return notification.error("Please select at least one source item or category to move.");
        }
        if (!targetDestination) {
            return notification.error("Please select a destination.");
        }

        if (standaloneItems.length > 0 && targetDestination.type !== 'subcategory') {
            return notification.error("Items must be moved into a subcategory, not directly into a main category.");
        }

        setIsSaving(true);
        try {
            // 1. Moving Items
            if (standaloneItems.length > 0) {
                const targetCategoryId = targetDestination.type === 'category' ? targetDestination.id : 
                    categories.find(c => c._id === targetDestination.id)?.parentCategory || null;
                const targetSubCategoryId = targetDestination.type === 'subcategory' ? targetDestination.id : null;
                
                await MenuService.bulkUpdateStructure(restaurantId, {
                    action: "move_items",
                    payload: {
                        itemIds: standaloneItems,
                        targetCategoryId: targetCategoryId || targetDestination.id, // Fallback if promoting items to root
                        targetSubCategoryId
                    }
                });
            }

            // 2. Moving Subcategories
            if (selectedSources.subcategories.length > 0) {
                if (targetDestination.type === 'subcategory') {
                    // Cannot move subcategory into subcategory, maybe merge?
                    await MenuService.bulkUpdateStructure(restaurantId, {
                        action: "merge",
                        payload: {
                            sourceIds: selectedSources.subcategories,
                            targetId: targetDestination.id,
                            type: 'subcategory'
                        }
                    });
                } else {
                    await MenuService.bulkUpdateStructure(restaurantId, {
                        action: "move_subcategories",
                        payload: {
                            subCategoryIds: selectedSources.subcategories,
                            targetCategoryId: targetDestination.type === 'main' ? null : targetDestination.id
                        }
                    });
                }
            }

            // 3. Merging/Moving Main Categories
            if (selectedSources.categories.length > 0) {
                if (targetDestination.type === 'category') {
                    // Merge categories
                    await MenuService.bulkUpdateStructure(restaurantId, {
                        action: "merge",
                        payload: {
                            sourceIds: selectedSources.categories,
                            targetId: targetDestination.id,
                            type: 'category'
                        }
                    });
                } else {
                    notification.error("Cannot move a main category into a subcategory or root.");
                }
            }

            notification.success("Menu structure updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            handleClearSelection();
            
        } catch (error) {
            console.error("Structure update error:", error);
            notification.error(error?.response?.data?.message || "Failed to update structure.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingCats || isLoadingItems) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <Loader />
            </div>
        );
    }

    const totalSelectedCount = selectedSources.categories.length + selectedSources.subcategories.length + selectedSources.items.length;

    return (
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden font-poppins">
            <div className="flex flex-1 overflow-hidden">
                <SelectSources 
                    categories={categories} 
                    items={items} 
                    selectedSources={selectedSources}
                    setSelectedSources={setSelectedSources}
                    addCategory={addCategory}
                    updateCategory={updateCategory}
                    deleteCategory={deleteCategory}
                    deleteItem={deleteItem}
                />
                
                <div className="w-[1px] bg-gray-200 z-10"></div>
                
                <SelectDestination 
                    categories={categories}
                    targetDestination={targetDestination}
                    setTargetDestination={setTargetDestination}
                    selectedSources={selectedSources}
                    standaloneItems={standaloneItems}
                />
            </div>

            <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex items-center justify-between px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <div className="text-[14px] text-slate-700 font-medium">
                    Ready to move <span className="font-bold text-slate-900">{selectedSources.items.length} items</span> and <span className="font-bold text-slate-900">{selectedSources.subcategories.length} subcategories</span>.
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleClearSelection}
                        disabled={isSaving || totalSelectedCount === 0}
                        className="font-semibold font-sans px-5 rounded-md border border-gray-300 text-slate-700 hover:bg-gray-100 transition-all shadow-none h-10"
                    >
                        Clear Selection
                    </Button>
                    <Button 
                        onClick={handleConfirmMove}
                        disabled={isSaving || totalSelectedCount === 0 || !targetDestination}
                        className="bg-primary hover:bg-primary/90 text-white font-semibold font-sans px-6 rounded-md shadow-md h-10 flex items-center gap-2 transition-all"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Confirm Move
                    </Button>
                </div>
            </div>
        </div>
    );
}
