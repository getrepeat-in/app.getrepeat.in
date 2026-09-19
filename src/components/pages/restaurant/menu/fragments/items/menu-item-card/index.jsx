import { useState, useEffect } from "react";
import ItemDetails from "./fragments/ItemDetails";
import ItemVariants from "./fragments/ItemVariants";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useItemVariants } from "./hooks/useItemVariants";
import useNotification from "@/store/hooks/useNotification";

export default function MenuItemRow({
    item: initialItem,
    onChange,
    onDelete,
}) {
    const [item, setItem] = useState(initialItem);
    const notification = useNotification();

    useEffect(() => {
        setItem(initialItem);
    }, [initialItem]);

    const isEdited = JSON.stringify(item) !== JSON.stringify(initialItem) || item?.isTemp;

    const [isHovered, setIsHovered] = useState(false);
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

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onChange?.(item);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className={`group border rounded-xl p-2.5 transition-all duration-300 relative ${
                item?.status === 'delete' ? "bg-red-50 border-red-300 pointer-events-none opacity-60" :
                item?.id?.toString().startsWith("temp-") 
                    ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 shadow-sm"
                    : "bg-white hover:border-orange-300 hover:shadow-md"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
            
            <ItemDetails 
                item={item}
                updateField={updateField}
                onDelete={onDelete}
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
    );
}
