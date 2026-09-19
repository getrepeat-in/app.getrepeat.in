"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import { BulkTable } from "../shared/bulk-table";
import { getCategoryName } from "../helpers/utils";
import { Loader2, Layers, Save } from "lucide-react";
import { VariantsCell } from "./fragments/VariantsCell";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { usePriceEditor } from "./fragments/usePriceEditor";
import useNotification from "@/store/hooks/useNotification";
import { BulkPriceUpdateSheet } from "../bulk-price-update-sheet";

export function PriceEditor() {
    const { restaurantId } = useRestaurant();
    const { items, isLoading: itemsLoading } = useItem(restaurantId, {});
    const { rawCategories, isLoading: catsLoading } = useCategory(restaurantId);
    const editor = usePriceEditor(restaurantId);
    const [isBulkSheetOpen, setIsBulkSheetOpen] = useState(false);
    const notification = useNotification();


    if (itemsLoading || catsLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 font-sans">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    const columns = [
        {
            header: "Item Name",
            width: "30%",
            render: (item) => {
                const catName = getCategoryName(item.category, rawCategories) || 'Uncategorized';
                const subCatName = getCategoryName(item.subCategory, rawCategories);
                const catPath = subCatName ? `${catName} > ${subCatName}` : catName;
                
                return (
                    <div className="flex flex-col pt-1">
                        <span className="font-semibold font-sans text-gray-800 text-[14px] tracking-tight">{item.name}</span>
                        <span className="text-[11px] font-medium font-sans text-gray-400 mt-0.5 uppercase tracking-wide">{catPath}</span>
                    </div>
                );
            }
        },
        {
            header: "Base Price (₹)",
            width: "15%",
            render: (item) => {
                const itemId = String(item.id || item._id);
                return (
                    <div className="pt-1">
                        <Input 
                            type="number" 
                            value={editor.editedItems[itemId]?.base_price !== undefined ? editor.editedItems[itemId].base_price : (item.base_price || 0)}
                            onChange={(e) => editor.handleBasePriceChange(itemId, e.target.value)}
                            className="w-[70px] font-semibold font-sans text-[13px] text-slate-800 border-gray-200 focus:border-primary focus:ring-primary/10 rounded-md h-[34px] shadow-none px-3"
                        />
                    </div>
                );
            }
        },
        {
            header: "Variants Prices (₹)",
            className: "pl-4",
            render: (item) => (
                <VariantsCell item={item} editor={editor} />
            )
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto flex flex-col relative h-full font-sans">
            <div className="sticky top-0 z-10 bg-white flex flex-col">
                <div className="border-b flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 font-sans">Price Editor</h2>
                        <p className="text-xs text-gray-500 mt-1 font-sans">Manage base prices and variants for all your items.</p>
                    </div>
                    <div className="flex items-center gap-2">

                        <Button 
                            variant="outline" 
                            onClick={() => setIsBulkSheetOpen(true)}
                            className="font-semibold font-sans px-4 rounded-md border-2 border-primary/50 hover:border-primary text-slate-800 hover:bg-primary/5 transition-all shadow-none h-8 text-xs flex items-center gap-1.5"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Bulk Update
                        </Button>
                        <Button 
                            onClick={editor.handleSave} 
                            disabled={editor.isSaving || Object.keys(editor.editedItems).length === 0}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold font-sans px-4 rounded-md shadow-none h-8 text-xs flex items-center gap-1.5"
                        >
                            {editor.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="flex-1">
                <BulkTable 
                    columns={columns} 
                    data={items} 
                    rowKey="id" 
                    emptyMessage="No items found for this restaurant." 
                />
            </div>
            
            <BulkPriceUpdateSheet 
                open={isBulkSheetOpen} 
                onOpenChange={setIsBulkSheetOpen} 
                items={items}
                categories={rawCategories}
                onApply={editor.applyBulkPriceUpdate}
            />
        </div>
    );
}
