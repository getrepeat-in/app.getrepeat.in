import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/frontend/menu";
import useNotification from "@/store/hooks/useNotification";
import { applyBulkMathToItems } from '../../helpers/priceCalculator';

export function usePriceEditor(restaurantId) {
    const [editedItems, setEditedItems] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const notification = useNotification();
    const queryClient = useQueryClient();

    const handleSave = async () => {
        const payload = Object.values(editedItems);
        if (payload.length === 0) {
            notification.error("No changes to save.");
            return;
        }

        setIsSaving(true);
        try {
            await MenuService.bulkUpdatePrice(restaurantId, { items: payload });
            notification.success("Prices updated successfully in bulk!");
            setEditedItems({});
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
        } catch (err) {
            console.error("Save error:", err);
            notification.error(err?.response?.data?.message || "Failed to update prices.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBasePriceChange = (itemId, value) => {
        setEditedItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                id: itemId,
                base_price: Number(value)
            }
        }));
    };

    const handleVariantPriceChange = (itemId, originalVariants, vIndex, oIndex, value) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            if (!itemUpdate.variants) {
                itemUpdate.variants = JSON.parse(JSON.stringify(originalVariants || []));
            } else {
                itemUpdate.variants = JSON.parse(JSON.stringify(itemUpdate.variants));
            }
            itemUpdate.variants[vIndex].options[oIndex].price = Number(value);
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleAddVariant = (itemId, originalVariants) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            const newVariants = itemUpdate.variants 
                ? JSON.parse(JSON.stringify(itemUpdate.variants)) 
                : JSON.parse(JSON.stringify(originalVariants || []));
            newVariants.push({ property_name: "Size", options: [{ name: "Regular", price: 0 }] });
            itemUpdate.variants = newVariants;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleAddOption = (itemId, originalVariants, vIndex) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            const newVariants = itemUpdate.variants 
                ? JSON.parse(JSON.stringify(itemUpdate.variants)) 
                : JSON.parse(JSON.stringify(originalVariants || []));
            newVariants[vIndex].options.push({ name: "New Option", price: 0 });
            itemUpdate.variants = newVariants;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleRemoveOption = (itemId, originalVariants, vIndex, oIndex) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            const newVariants = itemUpdate.variants 
                ? JSON.parse(JSON.stringify(itemUpdate.variants)) 
                : JSON.parse(JSON.stringify(originalVariants || []));
            newVariants[vIndex].options.splice(oIndex, 1);
            if (newVariants[vIndex].options.length === 0) {
                newVariants.splice(vIndex, 1);
            }
            itemUpdate.variants = newVariants;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleRemoveAllVariants = (itemId) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            itemUpdate.variants = [];
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const [copiedVariants, setCopiedVariants] = useState(null);

    const handleCopyVariants = (variants) => {
        if (!variants || variants.length === 0) return;
        setCopiedVariants(JSON.parse(JSON.stringify(variants)));
        notification.success("Variants structure copied!");
    };

    const handlePasteVariants = (itemId) => {
        if (!copiedVariants) return;
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            itemUpdate.variants = JSON.parse(JSON.stringify(copiedVariants));
            return { ...prev, [itemId]: itemUpdate };
        });
        notification.success("Variants pasted successfully!");
    };

    const handleVariantGroupNameChange = (itemId, originalVariants, vIndex, value) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            if (!itemUpdate.variants) {
                itemUpdate.variants = JSON.parse(JSON.stringify(originalVariants || []));
            } else {
                itemUpdate.variants = JSON.parse(JSON.stringify(itemUpdate.variants));
            }
            itemUpdate.variants[vIndex].property_name = value;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleVariantOptionNameChange = (itemId, originalVariants, vIndex, oIndex, value) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            if (!itemUpdate.variants) {
                itemUpdate.variants = JSON.parse(JSON.stringify(originalVariants || []));
            } else {
                itemUpdate.variants = JSON.parse(JSON.stringify(itemUpdate.variants));
            }
            itemUpdate.variants[vIndex].options[oIndex].name = value;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const applyBulkPriceUpdate = ({ applyTo, selectedCats, selectedItems, action, type, value, roundingOption, items }) => {
        setEditedItems(prev => {
            return applyBulkMathToItems({
                items,
                editedItems: prev,
                applyTo,
                selectedItems,
                selectedCats,
                action,
                type,
                value,
                roundingOption
            });
        });
    };

    return {
        editedItems,
        isSaving,
        handleSave,
        handleBasePriceChange,
        handleVariantPriceChange,
        handleAddVariant,
        handleAddOption,
        handleRemoveOption,
        handleRemoveAllVariants,
        applyBulkPriceUpdate,
        copiedVariants,
        handleCopyVariants,
        handlePasteVariants,
        handleVariantGroupNameChange,
        handleVariantOptionNameChange
    };
}
