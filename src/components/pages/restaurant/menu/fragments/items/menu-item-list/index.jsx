"use client";
import React, { useMemo } from "react";
import MenuItemRow from "../menu-item-card";
import { useItem } from "@/store/hooks/useItem";
import Loader from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus } from "lucide-react";
import EmptyState from "@/components/global/empty-state";
import { useRestaurant } from "@/store/hooks/useRestaurant";

export default function MenuItemList({ activeCategoryId, activeSubCategoryId }) {
    const { restaurantId } = useRestaurant();
    const { items = [], isLoading, addItem, updateItem, deleteItem } = useItem(restaurantId, activeSubCategoryId ? { subCategoryId: activeSubCategoryId } : {});
    const [tempItems, setTempItems] = React.useState([]);

    React.useEffect(() => {
        setTempItems([]);
    }, [activeSubCategoryId]);
    
    const handleAddItem = () => {
        if (!activeSubCategoryId || !activeCategoryId) return;

        setTempItems(prev => [
            {
                id: `temp-${crypto.randomUUID()}`,
                subCategory: activeSubCategoryId,
                category: activeCategoryId, 
                name: "New Item",
                base_price: 0,
                description: "",
                dietaryType: "veg",
                isAvailable: true,
                variants: [],
                isTemp: true,
            },
            ...prev
        ]);
    };

    const combinedItems = useMemo(() => [...tempItems, ...items], [tempItems, items]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <Loader />
            </div>
        );
    }

    if (combinedItems.length === 0) {
        return (
            <div className="flex-1 flex bg-white m-3 items-center h-[100%] justify-center p-2">
                <EmptyState
                    className={"w-full h-full"}
                    icon={UtensilsCrossed}
                    title="No Menu Items Found"
                    description="You haven't got any items in this subcategory yet."
                    action={
                        <Button onClick={handleAddItem} size="sm" className="h-8 text-xs font-medium rounded-md gap-1.5 shadow-xs">
                            <Plus className="size-3.5" />
                            Add Item
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-white m-3 flex flex-col min-w-0 overflow-y-auto p-3 sm:p-4 space-y-3 pb-16">
            {combinedItems.map((item) => (
                <MenuItemRow
                    key={item.id}
                    item={item}
                    onChange={(updatedItem) => {
                        if (item.isTemp) {
                            const { id, isTemp, ...dataToSave } = updatedItem;
                            return addItem(dataToSave, {
                                onSuccess: () => {
                                    setTempItems((prev) => prev.filter((i) => i.id !== item.id));
                                }
                            });
                        }
                        return updateItem({ itemId: item.id, data: updatedItem });
                    }}
                    onDelete={() => {
                        if (item.isTemp) {
                            setTempItems((prev) => prev.filter((i) => i.id !== item.id));
                        } else {
                            deleteItem(item.id);
                        }
                    }}
                />
            ))}
        </div>
    );
}