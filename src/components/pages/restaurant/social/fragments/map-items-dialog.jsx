"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { MenuService } from "@/services/frontend/menu";
import { useQuery } from "@tanstack/react-query";
import useNotification from "@/store/hooks/useNotification";
import api from "@/lib/api/axiosInstance";
import { NestedItemSelection } from "@/components/global/nested-item-selector";

export default function MapItemsDialog({ isOpen, onClose, post, restaurantId, onSuccess }) {
    const notification = useNotification();
    const [selectedItems, setSelectedItems] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize selected items from the post's existing mappings
    useEffect(() => {
        if (post && post.mappedItems) {
            setSelectedItems(post.mappedItems.map(item => item.id || item._id));
        } else {
            setSelectedItems([]);
        }
    }, [post]);

    const { data: menuData, isLoading: itemsLoading } = useQuery({
        queryKey: ["menu-items", restaurantId],
        queryFn: () => MenuService.item.getAll(restaurantId),
        enabled: isOpen,
    });

    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ["menu-categories", restaurantId],
        queryFn: () => MenuService.category.getAll(restaurantId),
        enabled: isOpen,
    });

    const isLoading = itemsLoading || categoriesLoading;
    const allItems = menuData?.data || [];
    const allCategories = categoriesData?.data || [];

    const toggleItem = (itemId) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            }
            if (prev.length >= 3) {
                notification.error("You can only map up to 3 items per post.");
                return prev;
            }
            return [...prev, itemId];
        });
    };

    const toggleCategoryList = (itemIds, isFullySelected) => {
        if (isFullySelected) {
            setSelectedItems(prev => prev.filter(id => !itemIds.includes(id)));
        } else {
            setSelectedItems(prev => {
                const newItems = [...new Set([...prev, ...itemIds])];
                if (newItems.length > 3) {
                    notification.error("You can only map up to 3 items per post.");
                    return newItems.slice(0, 3);
                }
                return newItems;
            });
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await api.post(`/api/restaurant/${restaurantId}/instagram/posts/mapping`, {
                postId: post.id,
                mappedItems: selectedItems
            });

            if (res.data?.success) {
                notification.success(res.data.message || "Items mapped successfully!");
                onSuccess();
            } else {
                throw new Error(res.data?.message || "Failed to map items");
            }
        } catch (error) {
            notification.error(error?.response?.data?.message || error.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Map Menu Items</DialogTitle>
                    <DialogDescription>
                        Select the menu items you want to feature alongside this Instagram post.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <ScrollArea className="h-[400px] border rounded-md p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : allItems.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                No menu items found.
                            </div>
                        ) : (
                            <NestedItemSelection
                                items={allItems}
                                categories={allCategories}
                                selectedItems={selectedItems}
                                onToggleItem={toggleItem}
                                onToggleCategory={toggleCategoryList}
                            />
                        )}
                    </ScrollArea>
                    <div className="text-xs text-muted-foreground text-right">
                        {selectedItems.length} items selected
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Mapping
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
