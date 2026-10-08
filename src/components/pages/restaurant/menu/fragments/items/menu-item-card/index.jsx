import { getImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useItemVariants } from "./hooks/useItemVariants";

import ItemDetails from "./fragments/ItemDetails";
import ItemVariants from "./fragments/ItemVariants";

import { ItemImage } from "@/components/global/item-image";
import useNotification from "@/store/hooks/useNotification";
import { CheckCircle2, Loader2, Edit2, Image as ImageIcon, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

export default function MenuItemRow({
    item: initialItem,
    onChange,
    onDelete,
}) {
    const [item, setItem] = useState(initialItem);
    const notification = useNotification();
    const [isSheetOpen, setIsSheetOpen] = useState(initialItem?.isTemp || false);

    useEffect(() => {
        setItem(initialItem);
    }, [initialItem]);

    const isEdited = JSON.stringify(item) !== JSON.stringify(initialItem) || item?.isTemp;
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const updateField = (field, value) => {
        setItem((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const variants = item?.variants || [];
    const {
        addVariantGroup,
        updateVariantGroup,
        deleteVariantGroup,
        addVariantOption,
        updateVariantOption,
        deleteVariantOption,
        addSuggestedVariant
    } = useItemVariants(variants, updateField, notification);

    const handleSave = async (e) => {
        if (e) e.stopPropagation();
        setIsSaving(true);
        try {
            await onChange?.(item);
            setIsSheetOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenChange = (open) => {
        setIsSheetOpen(open);
        if (!open && initialItem?.isTemp) {
            // If they cancel without saving a temp item, delete it
            onDelete?.();
        }
    };

    const handleDelete = async (e) => {
        if (e) e.stopPropagation();
        setIsDeleting(true);
        try {
            await onDelete?.(item);
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleAvailable = async (val) => {
        updateField("isAvailable", val);
        try {
            await onChange?.({ ...item, isAvailable: val });
        } catch (error) {
            // Revert will happen automatically when query refetches if it failed
        }
    };

    return (
        <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
            <div
                className={`group flex items-center justify-between border rounded-md p-3 sm:p-4 transition-all duration-300 relative ${
                    item?.status === 'delete' ? "bg-red-50 border-red-300 pointer-events-none opacity-60" :
                    initialItem?.isTemp 
                        ? "hidden"
                        : "bg-white hover:border-orange-300"
                }`}
            >


                <div 
                    className="flex items-center gap-4 flex-1 min-w-0 pr-2 sm:pr-4 cursor-pointer transition-opacity hover:opacity-80"
                    onClick={() => handleOpenChange(true)}
                >
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50">
                        {item?.image ? (
                            <ItemImage 
                                src={getImageUrl(item?.image, true, "thumbnail")} 
                                alt={item?.name} 
                                className="h-full w-full object-cover" 
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
                                <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                        )}
                        {item?.dietaryType && (
                            <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm rounded-sm p-0.5">
                                <div className={`w-3 h-3 rounded-sm border border-current flex items-center justify-center ${
                                    item.dietaryType === "veg" ? "text-green-600" :
                                    item.dietaryType === "non-veg" ? "text-red-600" :
                                    item.dietaryType === "egg" ? "text-yellow-600" :
                                    "text-green-600"
                                }`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-start sm:items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                                {item?.name || "Unnamed Item"}
                            </h4>
                            <span className="font-semibold text-sm sm:text-base text-foreground shrink-0">
                                ₹{item?.base_price || 0}
                            </span>
                        </div>
                        {item?.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                {item.description}
                            </p>
                        )}
                        {variants.length > 0 && (
                            <p className="text-[10px] sm:text-xs font-semibold text-primary/80 mt-1.5 bg-primary/10 w-fit px-2 py-0.5 rounded-md">
                                {variants.length} Variant{variants.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-2 sm:pl-4 border-l border-border/50">
                    <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:block">
                            {item?.isAvailable ?? true ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <Switch 
                            checked={item?.isAvailable ?? true}
                            onCheckedChange={toggleAvailable}
                            className="data-[state=checked]:bg-emerald-500 scale-75 sm:scale-90"
                        />
                    </div>
                    

                </div>
            </div>

            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col bg-gray-50 dark:bg-zinc-950 border-l gap-0">
                <SheetHeader className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b shrink-0">
                    <SheetTitle>Edit Menu Item</SheetTitle>
                    <SheetDescription>Update details, pricing, and variants for this item.</SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-10 bg-white dark:bg-zinc-950">
                    <ItemDetails 
                        item={item}
                        updateField={updateField}
                    />

                    <ItemVariants 
                        variants={variants}
                        addVariantGroup={addVariantGroup}
                        updateVariantGroup={updateVariantGroup}
                        deleteVariantGroup={deleteVariantGroup}
                        addVariantOption={addVariantOption}
                        updateVariantOption={updateVariantOption}
                        deleteVariantOption={deleteVariantOption}
                        addSuggestedVariant={addSuggestedVariant}
                    />
                </div>
                
                <div className="shrink-0 p-4 bg-white dark:bg-zinc-900 border-t flex items-center gap-3 w-full">
                    <Button 
                        variant="secondary" 
                        onClick={() => handleOpenChange(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 h-11 text-[15px] font-bold"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || !isEdited} 
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-11 text-[15px] font-bold"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
