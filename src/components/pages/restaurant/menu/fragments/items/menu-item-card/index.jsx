import { getImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ItemDetails from "./fragments/ItemDetails";
import ItemVariants from "./fragments/ItemVariants";
import { useItemVariants } from "./hooks/useItemVariants";
import { ItemImage } from "@/components/global/item-image";
import useNotification from "@/store/hooks/useNotification";
import { CheckCircle2, Loader2, Edit2, Image as ImageIcon, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

export default function MenuItemRow({
    item: initialItem,
    onChange,
    onDelete,
}) {
    const [item, setItem] = useState(initialItem);
    const notification = useNotification();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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

    const handleDelete = async (e) => {
        if (e) e.stopPropagation();
        setIsDeleting(true);
        try {
            await onDelete?.(item);
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleAvailable = (val) => {
        updateField("isAvailable", val);
    };

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <div
                className={`group flex items-center justify-between border rounded-xl p-3 sm:p-4 transition-all duration-300 relative ${
                    item?.status === 'delete' ? "bg-red-50 border-red-300 pointer-events-none opacity-60" :
                    item?.id?.toString().startsWith("temp-") 
                        ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 shadow-sm"
                        : "bg-white hover:border-orange-300 hover:shadow-md"
                }`}
            >
                {isEdited && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white h-8 px-4 rounded-full shadow-lg shadow-orange-500/30 z-10 text-[11px] font-bold flex items-center gap-1.5 hover:from-orange-600 hover:to-orange-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none ring-2 ring-white"
                    >
                        {isSaving ? (
                            <Loader2 size={14} strokeWidth={3} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={14} strokeWidth={3} />
                        )}
                        {isSaving ? "SAVING..." : "SAVE"}
                    </button>
                )}

                <div className="flex items-center gap-4 flex-1 min-w-0 pr-2 sm:pr-4">
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
                            <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm rounded-sm p-0.5 shadow-xs">
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
                    
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted">
                                <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                        </SheetTrigger>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8 text-red-400 hover:text-red-600 bg-red-50/50 hover:bg-red-100"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto pb-24 border-l bg-gray-50 dark:bg-zinc-950">
                <SheetHeader className="mb-6">
                    <SheetTitle>Edit Menu Item</SheetTitle>
                    <SheetDescription>Update details, pricing, and variants for this item.</SheetDescription>
                </SheetHeader>
                
                <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
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
                
                <div className="sticky bottom-0 left-0 right-0 p-4 -mx-6 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-10 flex items-center justify-between sm:justify-end gap-3 mt-8">
                    <Button 
                        variant="secondary" 
                        onClick={() => setIsSheetOpen(false)}
                        className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || !isEdited} 
                        className="w-full sm:w-auto shadow-md bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
