import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import DataTable from "@/components/global/table";
import { useState, useMemo, useRef } from "react";
import { MenuService } from "@/services/frontend/menu";
import { useQueryClient } from "@tanstack/react-query";
import { ImageSidebar } from "./fragments/ImageSidebar";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { ImageUploadCard } from "./fragments/ImageUploadCard";
import { FoodsnapService } from "@/services/frontend/foodsnap";
import { ImageIcon, Sparkles, Loader2, StopCircle } from "lucide-react";

export function ImageEditor() {
    const { restaurantId } = useRestaurant();
    const queryClient = useQueryClient();
    const notification = useNotification();

    const { rawCategories: categories = [], isLoading: isLoadingCats } = useCategory(restaurantId);
    const { items = [], updateItem, isLoading: isLoadingItems } = useItem(restaurantId, { fetchAll: true });
    
    const [selectedItemForSidebar, setSelectedItemForSidebar] = useState(null);
    const [activeFilterTab, setActiveFilterTab] = useState("all");

    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [processingItemId, setProcessingItemId] = useState(null);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
    const cancelRef = useRef(false);

    const categoryNameMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat._id] = cat.name;
            return acc;
        }, {});
    }, [categories]);

    const getCategoryPath = (item) => {
        const catName = categoryNameMap[item.category];
        const subName = categoryNameMap[item.subCategory];
        
        if (catName && subName) return `${catName} > ${subName}`;
        if (catName) return catName;
        return "Uncategorized";
    };

    const handleUploadComplete = async (itemId, imageId) => {
        await updateItem({ itemId, data: { image: imageId } });
    };

    const itemsWithoutImage = useMemo(() => {
        return items.filter(item => !item.image);
    }, [items]);

    const filterTabs = useMemo(() => [
        { id: "all", label: `All Dishes (${items.length})` },
        { id: "missing", label: `Without Photos (${itemsWithoutImage.length})` },
        { id: "with_photos", label: `With Photos (${items.length - itemsWithoutImage.length})` },
    ], [items.length, itemsWithoutImage.length]);

    const displayItems = useMemo(() => {
        if (activeFilterTab === "missing") return itemsWithoutImage;
        if (activeFilterTab === "with_photos") return items.filter(item => !!item.image);
        return items;
    }, [items, itemsWithoutImage, activeFilterTab]);

    const handleBulkAutoApply = async () => {
        if (isBulkProcessing || itemsWithoutImage.length === 0) return;

        setIsBulkProcessing(true);
        cancelRef.current = false;
        const queue = [...itemsWithoutImage];
        const total = queue.length;
        let successCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < total; i++) {
            if (cancelRef.current) break;

            const item = queue[i];
            setProcessingItemId(item._id);
            setBulkProgress({ current: i + 1, total });

            try {
                const res = await FoodsnapService.autoApplyImage({
                    item,
                    restaurantId
                });

                const updateRes = await MenuService.item.update(restaurantId, item._id, { image: res.imageId });
                successCount++;

                const updatedItem = updateRes?.data;
                const populatedImage = updatedItem?.image || {
                    card: res.imageUrl,
                    thumbnail: res.imageUrl,
                    original: res.imageUrl,
                };

                queryClient.setQueriesData({ queryKey: ["items", restaurantId] }, (old) => {
                    if (!old) return old;
                    if (Array.isArray(old)) {
                        return old.map(d => (d._id === item._id ? { ...(updatedItem || d), image: populatedImage } : d));
                    }
                    if (Array.isArray(old.data)) {
                        return {
                            ...old,
                            data: old.data.map(d => (d._id === item._id ? { ...(updatedItem || d), image: populatedImage } : d))
                        };
                    }
                    return old;
                });
            } catch (err) {
                console.warn(`No image found or failed for ${item.name}:`, err);
                skippedCount++;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        setProcessingItemId(null);
        setIsBulkProcessing(false);
        await queryClient.refetchQueries({ queryKey: ["items", restaurantId] });

        if (successCount > 0) {
            notification.success(
                `Successfully auto-applied images to ${successCount} dishes!${skippedCount > 0 ? ` (${skippedCount} had no match)` : ""}`
            );
        } else if (!cancelRef.current) {
            notification.info("No matching images were found for the dishes.");
        }
    };

    const handleStopBulk = async () => {
        cancelRef.current = true;
        setIsBulkProcessing(false);
        setProcessingItemId(null);
        await queryClient.refetchQueries({ queryKey: ["items", restaurantId] });
        notification.info("Auto-apply stopped.");
    };

    return (
        <div className="flex-1 flex flex-col bg-white h-full overflow-y-auto p-4 md:p-5">
            <DataTable
                containerClassName="flex-1 flex flex-col min-h-0"
                title="Dish Image Manager"
                subtitle="Easily manage, upload, and auto-match photos for all menu dishes"
                data={displayItems}
                searchable={true}
                searchKeys={["name"]}
                filterTabs={filterTabs}
                activeFilterTab={activeFilterTab}
                onFilterTabChange={setActiveFilterTab}
                actions={
                    isBulkProcessing ? (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                disabled
                                className="gap-2 bg-primary/90 text-primary-foreground font-semibold text-xs h-9 rounded-lg shadow-xs"
                            >
                                <Loader2 className="size-3.5 animate-spin" />
                                Applying ({bulkProgress.current}/{bulkProgress.total})...
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleStopBulk}
                                className="gap-1.5 text-xs h-9 rounded-lg shadow-xs cursor-pointer"
                            >
                                <StopCircle className="size-3.5" />
                                Stop
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            onClick={handleBulkAutoApply}
                            disabled={itemsWithoutImage.length === 0}
                            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 rounded-lg shadow-xs cursor-pointer"
                        >
                            <Sparkles className="size-3.5" />
                            Auto-Apply All Missing ({itemsWithoutImage.length})
                        </Button>
                    )
                }
                isLoading={isLoadingCats || isLoadingItems}
                renderGrid={(paginatedItems) => (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {paginatedItems.map((item) => (
                            <ImageUploadCard
                                key={item._id}
                                item={item}
                                categoryPath={getCategoryPath(item)}
                                updateItem={updateItem}
                                restaurantId={restaurantId}
                                onCardClick={() => setSelectedItemForSidebar(item)}
                                isProcessing={processingItemId === item._id}
                            />
                        ))}
                    </div>
                )}
                renderGridLoading={() => (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                            <div key={item} className="flex flex-col bg-white border border-border/60 rounded-xl overflow-hidden shadow-sm">
                                <div className="aspect-[4/3] w-full bg-muted/60 animate-pulse" />
                                <div className="p-3 space-y-2.5">
                                    <div className="h-3 w-2/3 bg-muted/70 rounded animate-pulse" />
                                    <div className="h-2.5 w-1/2 bg-muted/50 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                emptyState={{
                    icon: <ImageIcon size={28} className="text-gray-400 dark:text-zinc-600" />,
                    title: "No Dishes Found",
                    description: "No menu items match your search or filter criteria."
                }}
            />

            <ImageSidebar
                item={selectedItemForSidebar}
                isOpen={!!selectedItemForSidebar}
                onClose={() => setSelectedItemForSidebar(null)}
                restaurantId={restaurantId}
                onUploadComplete={(imageId) => handleUploadComplete(selectedItemForSidebar._id, imageId)}
            />
        </div>
    );
}