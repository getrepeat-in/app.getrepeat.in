import { ImageIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { useItem } from "@/store/hooks/useItem";
import DataTable from "@/components/global/table";
import { ImageSidebar } from "./fragments/ImageSidebar";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { ImageUploadCard } from "./fragments/ImageUploadCard";

export function ImageEditor() {
    const { restaurantId } = useRestaurant();
    const { rawCategories: categories = [], isLoading: isLoadingCats } = useCategory(restaurantId);
    const { items = [], updateItem, isLoading: isLoadingItems } = useItem(restaurantId, { fetchAll: true });
    
    const [selectedItemForSidebar, setSelectedItemForSidebar] = useState(null);

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

    const totalCount = items.length;


    return (
        <div className="flex-1 flex flex-col bg-white h-full overflow-y-auto p-4 md:p-5">
            <DataTable
                containerClassName="flex-1 flex flex-col min-h-0"
                title="Dish Image Manager"
                subtitle="Easily manage and upload photos for all menu dishes"
                data={items}
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
                            />
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